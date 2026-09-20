'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { isValidPdfBuffer } from '@/lib/security';

/**
 * Register a team for Phase 1.
 * Only the team leader of a finalized team can do this.
 */
export async function registerForPhase1(teamId: string) {
  return {
    success: false,
    error: 'Phase 1 registration is officially closed and concluded.',
  };
}

/**
 * Upload a PDF for Phase 1 submission.
 * Only the team leader of a registered team can do this.
 * No deadline restriction: registered teams can upload or update anytime before pitching.
 */
export async function uploadPhase1PDF(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized. Please sign in.' };

    const file = formData.get('file') as File;
    const teamId = formData.get('teamId') as string;

    if (!file || !teamId) return { success: false, error: 'Missing file or team info' };
    if (file.size > 2 * 1024 * 1024) return { success: false, error: 'File size must be under 2MB. Please compress your PDF.' };
    
    const fileName = file.name?.toLowerCase() || '';
    if (!fileName.endsWith('.pdf')) {
      return { success: false, error: 'Only PDF files (.pdf) are allowed' };
    }

    const supabase = createAdminClient();

    // Fetch user, team, and registration in parallel to minimize latency on mobile connections
    const [userRes, teamRes, regRes] = await Promise.all([
      supabase.from('users').select('team_id, role').eq('id', userId).single(),
      supabase.from('teams').select('leader_id').eq('id', teamId).single(),
      supabase.from('phase1_registrations').select('id').eq('team_id', teamId).single()
    ]);

    const user = userRes.data;
    const team = teamRes.data;
    const reg = regRes.data;
    const isSuperAdmin = user?.role === 'super_admin';

    if (!isSuperAdmin) {
      if (user?.team_id !== teamId) return { success: false, error: 'Unauthorized for this team' };
      if (team?.leader_id !== userId) return { success: false, error: 'Only the team leader can upload the presentation' };
    }

    if (!reg) return { success: false, error: 'Team is not registered for Phase 1' };

    // Convert file to buffer for robust upload in Node/serverless runtime
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidPdfBuffer(buffer)) {
      return { success: false, error: 'Uploaded file is not a valid PDF document' };
    }

    // Upload to phase1_pdfs bucket with cacheControl 0 to prevent CDN caching on update
    const { error } = await supabase.storage
      .from('phase1_pdfs')
      .upload(`${teamId}.pdf`, buffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '0',
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/phase1/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('uploadPhase1PDF error:', err);
    return { success: false, error: err?.message || 'Server error during upload' };
  }
}
