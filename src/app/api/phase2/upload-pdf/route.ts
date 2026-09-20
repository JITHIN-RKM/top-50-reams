import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { isValidPdfBuffer } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds execution time on Vercel

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in again.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const teamId = formData.get('teamId') as string | null;

    if (!file || !teamId) {
      return NextResponse.json({ success: false, error: 'Missing file or team info' }, { status: 400 });
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be under 4MB. Please compress your PDF.' }, { status: 400 });
    }

    const fileName = file.name?.toLowerCase() || '';
    if (!fileName.endsWith('.pdf')) {
      return NextResponse.json({ success: false, error: 'File must have a .pdf extension' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const [userRes, teamRes, regRes] = await Promise.all([
      supabase.from('users').select('team_id, role').eq('id', userId).single(),
      supabase.from('teams').select('leader_id').eq('id', teamId).single(),
      supabase.from('phase2_registrations').select('id').eq('team_id', teamId).maybeSingle(),
    ]);

    const user = userRes.data;
    const team = teamRes.data;
    const reg = regRes.data;
    const isSuperAdmin = user?.role === 'super_admin';

    if (!isSuperAdmin) {
      if (user?.team_id !== teamId) {
        return NextResponse.json({ success: false, error: 'Unauthorized for this team' }, { status: 403 });
      }
      if (team?.leader_id !== userId) {
        return NextResponse.json({ success: false, error: 'Only the team leader can upload the presentation' }, { status: 403 });
      }
    }

    if (!reg) {
      return NextResponse.json({ success: false, error: 'Team is not registered for Phase 2' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidPdfBuffer(buffer)) {
      return NextResponse.json({ success: false, error: 'Uploaded file is not a valid PDF document' }, { status: 400 });
    }

    const { error: uploadErr } = await supabase.storage
      .from('phase2_pdfs')
      .upload(`${teamId}.pdf`, buffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '0',
      });

    if (uploadErr) {
      console.error('Phase 2 API storage upload error:', uploadErr);
      return NextResponse.json({ success: false, error: uploadErr.message }, { status: 500 });
    }

    revalidatePath('/phase2/dashboard');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST /api/phase2/upload-pdf error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Server error during upload' }, { status: 500 });
  }
}
