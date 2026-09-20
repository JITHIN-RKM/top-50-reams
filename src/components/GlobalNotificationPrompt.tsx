'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Loader2 } from 'lucide-react';
import { savePushSubscription } from '@/lib/actions/user-actions';
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

export default function GlobalNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wait 5 seconds after component mounts (user lands on dashboard)
    const timer = setTimeout(() => {
      if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
        // Only show if they haven't made a choice yet and haven't dismissed the prompt
        if (Notification.permission === 'default') {
          const dismissed = localStorage.getItem('sih_push_prompt_dismissed');
          if (!dismissed) {
            setShow(true);
          }
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async () => {
    if (!publicVapidKey) {
      console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY in environment variables.");
      return;
    }
    setLoading(true);
    try {
      // Register the SW first — required before .ready can resolve on first visit
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
      const result = await savePushSubscription(JSON.parse(JSON.stringify(sub)));
      if (!result?.success) {
        throw new Error(result?.error || 'Database save failed');
      }
      setShow(false); // hide on success
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      if (Notification.permission === 'denied') {
        setShow(false); // hide if they denied
        toast.error('Notifications blocked. Enable them in your browser settings.');
      } else {
        toast.error(`Failed to enable notifications: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('sih_push_prompt_dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-sm w-[calc(100%-2rem)]">
      <div className="bg-white border-2 border-sih-blue p-4 shadow-xl flex flex-col gap-3 relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-sih-blue" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Don't miss out!</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Enable notifications to get instant alerts when new updates and important announcements are posted.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-center"
          >
            Not now
          </button>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-sih-blue hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
