'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { isRollNumberRequired } from '@/lib/constants';

export async function markAnnouncementsAsRead() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('users')
      .update({ last_read_announcements_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Failed to mark announcements as read:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function savePushSubscription(subscription: any) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const supabase = createAdminClient();

    // Check if subscription already exists for this endpoint
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .single();

    if (existing) {
      // Update user_id just in case
      await supabase
        .from('push_subscriptions')
        .update({ user_id: userId })
        .eq('id', existing.id);
      return { success: true };
    }

    const { error } = await supabase.from('push_subscriptions').insert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    });

    if (error) {
      console.error('Failed to save push subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export interface UpdateUserProfileData {
  full_name: string;
  roll_number?: string | null;
  branch: string;
  year: string;
  phone_country_code: string;
  phone_number: string;
  gender: string;
}

export async function updateUserProfile(data: UpdateUserProfileData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized. Please sign in.' };

    if (!data.full_name?.trim()) return { success: false, error: 'Full name is required.' };
    if (!data.branch?.trim()) return { success: false, error: 'Branch is required.' };
    if (!data.year?.trim()) return { success: false, error: 'Year / Role is required.' };
    if (!data.gender?.trim()) return { success: false, error: 'Gender is required.' };
    if (!data.phone_number?.trim() || data.phone_number.trim().length < 7) {
      return { success: false, error: 'A valid phone number is required.' };
    }

    if (isRollNumberRequired(data.year) && (!data.roll_number || !data.roll_number.trim())) {
      return { success: false, error: `Roll number is mandatory for ${data.year}.` };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('users')
      .update({
        full_name: data.full_name.trim(),
        roll_number: data.roll_number?.trim() || null,
        branch: data.branch.trim(),
        year: data.year.trim(),
        phone_country_code: data.phone_country_code?.trim() || '+91',
        phone_number: data.phone_number.trim(),
        gender: data.gender.trim(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    revalidatePath('/problem-statements');
    revalidatePath('/phase1');
    revalidatePath('/phase1/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('updateUserProfile error:', error);
    return { success: false, error: error.message || 'Failed to update profile' };
  }
}

export async function getCurrentUserProfile() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, data: null };

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, roll_number, branch, year, phone_country_code, phone_number, gender, role, onboarding_complete, team_id')
      .eq('id', userId)
      .single();

    if (error || !data) return { success: false, data: null };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, data: null };
  }
}

