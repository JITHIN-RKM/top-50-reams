import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: "Onboarding | OUCE SIH 2026",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (userId) {
    try {
      const supabase = createAdminClient();
      const { data: user } = await supabase
        .from('users')
        .select('onboarding_complete')
        .eq('id', userId)
        .single();

      if (user && user.onboarding_complete) {
        redirect('/dashboard');
      }
    } catch (err: any) {
      if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') throw err;
      // Allow it to proceed if db error, though ideally it should throw
    }
  }

  return <>{children}</>;
}
