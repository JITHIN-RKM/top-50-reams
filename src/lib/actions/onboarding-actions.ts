'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRollNumberRequired } from '@/lib/constants';
import { redirect } from 'next/navigation';

const SUPER_ADMIN_EMAILS = [
  'www.jithinr2006@gmail.com',
];

export interface OnboardingFormData {
  full_name: string;
  roll_number: string;
  branch: string;
  year: string;
  phone_country_code: string;
  phone_number: string;
  gender: string;
}

export async function completeOnboarding(formData: OnboardingFormData) {
  const user = await currentUser();
  if (!user) return { error: 'Not authenticated' };

  if (isRollNumberRequired(formData.year) && (!formData.roll_number || !formData.roll_number.trim())) {
    return { error: 'Roll number is required for your selected year/degree.' };
  }

  try {
    const supabase = createAdminClient();
    const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase() ?? '';
    
    const assignedRole = SUPER_ADMIN_EMAILS.includes(userEmail) ? 'super_admin' : 'student';

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (existingUser) {
      if (existingUser.id !== user.id) {
        // Clerk ID changed (user deleted account and recreated). Sync the Supabase ID to the new Clerk ID.
        const { error: syncError } = await supabase
          .from('users')
          .update({ id: user.id })
          .eq('email', userEmail);
          
        if (syncError) {
          return { error: `Account Sync Error: Your email is tied to a previous session. Contact admin to reset your account.` };
        }
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          roll_number: formData.roll_number || null,
          branch: formData.branch,
          year: formData.year,
          phone_country_code: formData.phone_country_code,
          phone_number: formData.phone_number,
          gender: formData.gender,
          role: assignedRole,
          onboarding_complete: true,
        })
        .eq('id', user.id);

      if (error) return { error: `Database Update Error: ${error.message}` };
    } else {
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          full_name: formData.full_name,
          email: userEmail,
          roll_number: formData.roll_number || null,
          branch: formData.branch,
          year: formData.year,
          phone_country_code: formData.phone_country_code,
          phone_number: formData.phone_number,
          gender: formData.gender,
          role: assignedRole,
          onboarding_complete: true,
        });

      if (error) return { error: `Database Insert Error: ${error.message}` };
    }
  } catch (err: any) {
    return { error: `Server Crash: ${err.message}` };
  }

  return { success: true };
}

export async function checkOnboardingStatus(): Promise<{ complete: boolean; userData: any | null }> {
  const user = await currentUser();
  if (!user) return { complete: false, userData: null };

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!data) return { complete: false, userData: null };
  return { complete: data.onboarding_complete, userData: data };
}
