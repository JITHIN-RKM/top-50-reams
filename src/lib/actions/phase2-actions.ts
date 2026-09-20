'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { buildPhase2ConfirmationEmail } from '@/lib/emails/phase2-email';

import { isValidPdfBuffer } from '@/lib/security';

const resendApiKey = process.env.RESEND_API_KEY || 're_dummy_key_to_prevent_build_error';
const resend = new Resend(resendApiKey);

// Official WhatsApp group invite link for Phase 2 team leaders
const WHATSAPP_INVITE_LINK = process.env.PHASE2_WHATSAPP_LINK || 'https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV';

/**
 * Register a team for Phase 2.
 * Only the team leader of a finalized team can do this.
 * Open to all finalized teams (6 members, >=1 female, PS chosen).
 * Closes on 13 Sep 2026 at 11:59 PM. Pitching event is on 16 Sep 2026.
 */
export async function registerForPhase2(teamId: string, selectedPsId?: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Unauthorized' };

  // Phase 2 registrations are kept open until organizers manually close them
  const isRegistrationClosed = false;
  if (isRegistrationClosed) {
    return {
      success: false,
      error: 'Phase 2 registration is currently closed.',
    };
  }

  const supabase = createAdminClient();

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, leader_id, status, ps1_id, ps2_id, users!fk_users_team(id, full_name, email, gender, branch, year)')
    .eq('id', teamId)
    .single();

  if (!team) return { success: false, error: 'Team not found' };
  if (team.leader_id !== userId) return { success: false, error: 'Only the team leader can register for Phase 2' };

  const users = (team.users as any[]) || [];
  const hasFemale = users.some((u: any) => u.gender === 'female');

  // Auto-finalize if team has 6 members and at least 1 female
  if (team.status !== 'finalized') {
    if (users.length === 6 && hasFemale) {
      await supabase.from('teams').update({ status: 'finalized' }).eq('id', teamId);
      team.status = 'finalized';
    } else {
      return {
        success: false,
        error: `Team must have exactly 6 members (currently ${users.length}) with at least 1 female member before registering for Phase 2.`,
      };
    }
  }

  if (users.length !== 6) return { success: false, error: 'Team must have exactly 6 members to register' };
  if (!hasFemale) return { success: false, error: 'Team must have at least 1 female member (SIH rule)' };

  // If a PS ID is provided, save it as primary PS (ps1_id)
  if (selectedPsId) {
    try {
      const psDataRaw = require('@/data/sih-2026-data.json');
      if (psDataRaw.some((ps: any) => ps.id === selectedPsId)) {
        await supabase.from('teams').update({ ps1_id: selectedPsId }).eq('id', teamId);
        team.ps1_id = selectedPsId;
      } else {
        return { success: false, error: 'Invalid Problem Statement ID. Please check the PS Explorer.' };
      }
    } catch (e) {
      console.error('Error validating PS during registration', e);
    }
  }

  if (!team.ps1_id && !team.ps2_id) {
    return { success: false, error: 'Please select a Problem Statement to complete Phase 2 registration.' };
  }

  const { data: existing } = await supabase
    .from('phase2_registrations')
    .select('id')
    .eq('team_id', teamId)
    .maybeSingle();

  if (existing) return { success: false, error: 'Your team is already registered for Phase 2' };

  const { error } = await supabase
    .from('phase2_registrations')
    .insert({ team_id: teamId, registered_by: userId });

  if (error) return { success: false, error: error.message };

  const leader = users.find((u: any) => u.id === userId);
  let leaderEmail = leader?.email;
  let leaderName = leader?.full_name || 'Team Leader';

  if (!leaderEmail) {
    const { data: leaderUser } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();
    if (leaderUser) {
      leaderEmail = leaderUser.email;
      leaderName = leaderUser.full_name || leaderName;
    }
  }

  // Send confirmation email asynchronously without blocking the user registration
  if (leaderEmail && process.env.RESEND_API_KEY) {
    resend.emails
      .send({
        from: 'OUCE SIH 2026 <updates@sih-ouce.meetthealtezza.tech>',
        to: leaderEmail,
        subject: `🚀 [SIH 2026] Phase 2 Registration Confirmed — ${team.name}`,
        html: buildPhase2ConfirmationEmail({
          teamName: team.name,
          leaderName,
          whatsappLink: WHATSAPP_INVITE_LINK,
        }),
      })
      .then((emailRes) => {
        console.log('Phase 2 confirmation email successfully sent to', leaderEmail, emailRes);
      })
      .catch((emailErr: any) => {
        console.error('Phase 2 confirmation email error:', emailErr?.message || emailErr);
      });
  }

  revalidatePath('/phase2');
  revalidatePath('/phase2/dashboard');
  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Upload a PDF for Phase 2 submission.
 * Registered teams can upload or update up to the event day (16 Sep).
 */
export async function uploadPhase2PDF(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized. Please sign in.' };

    const file = formData.get('file') as File;
    const teamId = formData.get('teamId') as string;

    if (!file || !teamId) return { success: false, error: 'Missing file or team info' };
    if (file.size > 4 * 1024 * 1024) return { success: false, error: 'File size must be under 4MB. Please compress your PDF.' };

    const fileName = file.name?.toLowerCase() || '';
    if (!fileName.endsWith('.pdf')) {
      return { success: false, error: 'Only PDF files (.pdf) are allowed' };
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
      if (user?.team_id !== teamId) return { success: false, error: 'Unauthorized for this team' };
      if (team?.leader_id !== userId) return { success: false, error: 'Only the team leader can upload the presentation' };
    }

    if (!reg) return { success: false, error: 'Team is not registered for Phase 2' };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidPdfBuffer(buffer)) {
      return { success: false, error: 'Uploaded file is not a valid PDF document' };
    }

    const { error } = await supabase.storage
      .from('phase2_pdfs')
      .upload(`${teamId}.pdf`, buffer, {
        contentType: 'application/pdf',
        upsert: true,
        cacheControl: '0',
      });

    if (error) {
      console.error('Phase 2 storage upload error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/phase2/dashboard');
    return { success: true };
  } catch (err: any) {
    console.error('uploadPhase2PDF error:', err);
    return { success: false, error: err?.message || 'Server error during upload' };
  }
}


