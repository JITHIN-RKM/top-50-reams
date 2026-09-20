'use client';

import { useState, useEffect } from 'react';
import { savePushSubscription } from '@/lib/actions/user-actions';
import { Bell, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const rawVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const publicVapidKey = rawVapidKey.replace(/^["']|["']$/g, '');

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  }

  async function subscribeToPush() {
    if (!publicVapidKey) {
      toast.error('VAPID key is missing from environment variables (Vercel).');
      return;
    }
    setLoading(true);
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
      const registration = await navigator.serviceWorker.ready;
      
      // Unsubscribe from any existing old subscription that might have a different VAPID key
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
      setSubscription(sub);
      const result = await savePushSubscription(JSON.parse(JSON.stringify(sub)));
      if (!result?.success) {
        throw new Error(result?.error || 'Database save failed');
      }
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      if (Notification.permission === 'denied') {
        toast.error('Notifications blocked. Enable them in your browser settings.');
      } else {
        toast.error(`Failed to enable notifications: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return <p className="text-sm text-gray-500">Push notifications are not supported in this browser.</p>;
  }

  return (
    <div className="flex flex-col items-start gap-2 p-4 border border-gray-200 rounded-md bg-white">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        <Bell className="w-4 h-4" /> Browser Notifications
      </h3>
      <p className="text-sm text-gray-500 mb-2">Get notified immediately when an announcement is posted.</p>
      
      {subscription ? (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <Check className="w-4 h-4" /> Enabled on this device
        </div>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-sih-blue text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          Enable Notifications
        </button>
      )}
    </div>
  );
}
