'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  const isSupabaseKeyError = error.message.includes('supabaseKey is required') || error.message.includes('SUPABASE_SERVICE_ROLE_KEY');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 font-body">
      <div className="bg-white border-2 border-red-100 rounded-2xl p-8 max-w-lg w-full text-center shadow-lg">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-sih-dark mb-4 uppercase tracking-tight">
          {isSupabaseKeyError ? 'Configuration Missing' : 'Something went wrong!'}
        </h2>
        
        <div className="text-sih-dark/70 mb-8 space-y-4 text-left bg-gray-50 p-4 rounded-lg text-sm font-medium">
          {isSupabaseKeyError ? (
            <>
              <p>
                <strong className="text-red-600">Root Cause:</strong> The application cannot connect to the database because the <code className="bg-gray-200 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is missing from your Vercel Environment Variables.
              </p>
              <p>
                <strong>How to fix this instantly:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Open your local <code className="bg-gray-200 px-1 py-0.5 rounded">.env.local</code> file.</li>
                <li>Copy the value of <code className="bg-gray-200 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code>.</li>
                <li>Go to Vercel Settings → Environment Variables.</li>
                <li>Add it, save, and redeploy.</li>
              </ol>
            </>
          ) : (
            <p>
              An unexpected error occurred while loading this page. 
              <br/><br/>
              <span className="font-mono text-xs text-red-500">{error.message}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-sih-dark text-white font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border-2 border-gray-200 text-sih-dark font-bold text-sm uppercase tracking-wider hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
