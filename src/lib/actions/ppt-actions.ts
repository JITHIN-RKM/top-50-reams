'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { isValidPdfBuffer } from '@/lib/security';

export async function uploadPPT(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const file = formData.get('file') as File;
    const teamId = formData.get('teamId') as string;

    if (!file || !teamId) return { success: false, error: 'Missing file or team info' };
    if (file.size > 2 * 1024 * 1024) return { success: false, error: 'File size must be under 2MB. Please compress your PDF.' };

    const fileName = file.name?.toLowerCase() || '';
    if (!fileName.endsWith('.pdf')) {
      return { success: false, error: 'Only PDF files (.pdf) are allowed' };
    }

    const supabase = createAdminClient();

    const { data: user } = await supabase.from('users').select('team_id, role').eq('id', userId).single();
    const isSuperAdmin = user?.role === 'super_admin';

    if (!isSuperAdmin) {
      if (user?.team_id !== teamId) return { success: false, error: 'Unauthorized for this team' };

      const { data: team } = await supabase.from('teams').select('status, leader_id').eq('id', teamId).single();
      if (!team) return { success: false, error: 'Team not found' };
      if (team.status !== 'finalized') return { success: false, error: 'Team must be finalized to submit PPT' };
      if (team.leader_id !== userId) return { success: false, error: 'Only the team leader can upload the presentation' };
    }

    // Convert file to buffer for robust upload in Node/serverless runtime
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidPdfBuffer(buffer)) {
      return { success: false, error: 'Uploaded file is not a valid PDF document' };
    }

    const { error } = await supabase.storage
      .from('team_ppts')
      .upload(`${teamId}.pdf`, buffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '0',
      });

    if (error) {
      console.error('PPT storage upload error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('uploadPPT error:', err);
    return { success: false, error: err?.message || 'Server error during upload' };
  }
}
