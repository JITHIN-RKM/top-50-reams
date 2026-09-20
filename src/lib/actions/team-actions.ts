'use server';

import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { globalLimiter, teamActionLimiter, spamLimiter } from '@/lib/rate-limit';

// Helper to get authenticated client context safely
async function getSupabaseAndUser(limiter?: { limit: (id: string) => Promise<{ success: boolean }> }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const targetLimiter = limiter || globalLimiter;
  const { success } = await targetLimiter.limit(userId);
  if (!success) throw new Error('Too many requests. Please try again later.');

  const supabase = createAdminClient();
  return { supabase, userId };
}

export async function createTeam(teamName: string) {
  let supabase, userId;
  try {
    const res = await getSupabaseAndUser(teamActionLimiter);
    supabase = res.supabase;
    userId = res.userId;
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const { data: user } = await supabase.from('users').select('team_id').eq('id', userId).single();
  if (user?.team_id) return { success: false, error: 'You are already in a team.' };

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let inviteCode = '';
  const randomValues = new Uint32Array(6);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 6; i++) {
    inviteCode += chars.charAt(randomValues[i] % chars.length);
  }

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name: teamName, invite_code: inviteCode, leader_id: userId })
    .select()
    .single();

  if (teamError || !team) return { success: false, error: teamError?.message || 'Failed to create team' };

  await supabase.from('users').update({ team_id: team.id }).eq('id', userId);
  revalidatePath('/dashboard');
  return { success: true, team };
}

export async function joinTeamByCode(code: string) {
  let supabase, userId;
  try {
    const res = await getSupabaseAndUser(teamActionLimiter);
    supabase = res.supabase;
    userId = res.userId;
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const { data: user } = await supabase.from('users').select('team_id').eq('id', userId).single();
  if (user?.team_id) return { success: false, error: 'You are already in a team.' };

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, status')
    .eq('invite_code', code.toUpperCase())
    .single();

  if (!team) return { success: false, error: 'Invalid invite code.' };
  if (team.status === 'finalized') return { success: false, error: 'This team has already finalized their roster.' };

  const { data: success, error: rpcError } = await supabase.rpc('atomic_add_team_member', {
    p_team_id: team.id,
    p_user_id: userId,
  });

  if (rpcError) return { success: false, error: rpcError.message };
  if (!success) return { success: false, error: 'This team is already full (6 members max).' };

  revalidatePath('/dashboard');
  return { success: true, team };
}

export async function leaveTeam() {
  const { supabase, userId } = await getSupabaseAndUser();

  const { data: user } = await supabase.from('users').select('team_id').eq('id', userId).single();
  if (!user?.team_id) return { success: false, error: 'You are not in a team.' };

  const { data: team } = await supabase
    .from('teams')
    .select('leader_id, status')
    .eq('id', user.team_id)
    .single();
  if (team?.status === 'finalized') return { success: false, error: 'Cannot leave a finalized team. Contact admin.' };

  if (team?.leader_id === userId) {
    const { count } = await supabase.from('users').select('id', { count: 'exact' }).eq('team_id', user.team_id);
    if (count && count > 1) return { success: false, error: 'Transfer leadership or remove other members before leaving.' };
    await supabase.from('teams').delete().eq('id', user.team_id);
  }

  await supabase.from('users').update({ team_id: null }).eq('id', userId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function removeMember(teamId: string, memberId: string) {
  const { supabase, userId } = await getSupabaseAndUser();

  // Verify requester is the team leader
  const { data: team } = await supabase.from('teams').select('leader_id, status').eq('id', teamId).single();
  if (!team) return { success: false, error: 'Team not found.' };
  if (team.leader_id !== userId) return { success: false, error: 'Only the team leader can remove members.' };
  if (team.status === 'finalized') return { success: false, error: 'Cannot remove members from a finalized team.' };

  // Cannot remove yourself (leader) via this action
  if (memberId === userId) return { success: false, error: 'Use "Leave Team" to remove yourself.' };

  await supabase.from('users').update({ team_id: null }).eq('id', memberId).eq('team_id', teamId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleLookingForMembers(teamId: string, open: boolean) {
  const { supabase, userId } = await getSupabaseAndUser();

  const { data: team } = await supabase.from('teams').select('leader_id').eq('id', teamId).single();
  if (team?.leader_id !== userId) return { success: false, error: 'Only the team leader can do this.' };

  await supabase.from('teams').update({ status: open ? 'open_for_members' : 'forming' }).eq('id', teamId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateOpenSlotRequirement(teamId: string, requirements: string[]) {
  const { supabase, userId } = await getSupabaseAndUser();

  const { data: team } = await supabase.from('teams').select('leader_id, status').eq('id', teamId).single();
  if (!team) return { success: false, error: 'Team not found.' };
  if (team.leader_id !== userId) return { success: false, error: 'Only the team leader can do this.' };
  if (team.status === 'finalized') return { success: false, error: 'Team is already finalized.' };

  // Store as JSON string (max 3 requirements)
  const trimmed = requirements.filter(r => r.trim().length > 0).slice(0, 3);
  await supabase.from('teams').update({ open_slot_requirement: JSON.stringify(trimmed) }).eq('id', teamId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function finalizeTeam(teamId: string) {
  const { supabase, userId } = await getSupabaseAndUser();

  const { data: team } = await supabase.from('teams').select('leader_id, status').eq('id', teamId).single();
  if (team?.leader_id !== userId) return { success: false, error: 'Only the team leader can do this.' };

  // Enforce exactly 6 members
  const { count } = await supabase.from('users').select('id', { count: 'exact' }).eq('team_id', teamId);
  if (!count || count !== 6) return { success: false, error: `Team must have exactly 6 members to finalize. Currently: ${count || 0}.` };

  await supabase.from('teams').update({ status: 'finalized' }).eq('id', teamId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function unfinalizeTeam(teamId: string) {
  const { supabase, userId } = await getSupabaseAndUser();

  const { data: team } = await supabase.from('teams').select('leader_id, status').eq('id', teamId).single();
  if (team?.leader_id !== userId) return { success: false, error: 'Only the team leader can do this.' };

  await supabase.from('teams').update({ status: 'forming' }).eq('id', teamId);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function saveProblemStatement(teamId: string, psId: string, slot: 1 | 2) {
  const { supabase, userId } = await getSupabaseAndUser();
  const { data: team } = await supabase.from('teams').select('leader_id, status, ps1_id, ps2_id').eq('id', teamId).single();
  if (!team) return { success: false, error: 'Team not found.' };
  if (team.leader_id !== userId) return { success: false, error: 'Only the team leader can do this.' };
  
  // Enforce max 2 limit conceptually (already handled by slot 1|2, but just in case)
  if (slot !== 1 && slot !== 2) return { success: false, error: 'Invalid slot.' };

  // Duplicate check
  if ((slot === 1 && team.ps2_id === psId) || (slot === 2 && team.ps1_id === psId)) {
    return { success: false, error: 'This Problem Statement is already selected.' };
  }

  try {
    const psDataRaw = require('@/data/sih-2026-data.json');
    if (!psDataRaw.some((ps: any) => ps.id === psId)) {
      return { success: false, error: 'Invalid Problem Statement ID — check PS Explorer.' };
    }
  } catch (e) {
    console.error('Error validating PS ID', e);
  }

  const updateData: any = {};
  if (slot === 1) updateData.ps1_id = psId;
  else updateData.ps2_id = psId;

  const { error } = await supabase.from('teams').update(updateData).eq('id', teamId);
  if (error) return { success: false, error: 'Failed to save Problem Statement.' };

  revalidatePath('/dashboard');
  revalidatePath('/problem-statements');
  revalidatePath('/phase2');
  revalidatePath('/phase2/dashboard');
  revalidatePath('/admin');
  return { success: true };
}

export async function removeProblemStatement(teamId: string, slot: 1 | 2) {
  const { supabase, userId } = await getSupabaseAndUser();
  const { data: team } = await supabase.from('teams').select('leader_id, status').eq('id', teamId).single();
  if (!team) return { success: false, error: 'Team not found.' };
  if (team.leader_id !== userId) return { success: false, error: 'Only the team leader can do this.' };
  
  const updateData: any = {};
  if (slot === 1) updateData.ps1_id = null;
  else updateData.ps2_id = null;

  const { error } = await supabase.from('teams').update(updateData).eq('id', teamId);
  if (error) return { success: false, error: 'Failed to remove Problem Statement.' };

  revalidatePath('/dashboard');
  revalidatePath('/problem-statements');
  revalidatePath('/phase2');
  revalidatePath('/phase2/dashboard');
  revalidatePath('/admin');
  return { success: true };
}

export async function requestToJoinTeam(teamId: string, message?: string) {
  let supabase, userId;
  try {
    const res = await getSupabaseAndUser(spamLimiter);
    supabase = res.supabase;
    userId = res.userId;
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const { data: user } = await supabase.from('users').select('team_id').eq('id', userId).single();
  if (user?.team_id) return { success: false, error: 'You are already in a team.' };

  const { data: team } = await supabase.from('teams').select('status').eq('id', teamId).single();
  if (!team || team.status === 'finalized') return { success: false, error: 'Team is finalized or does not exist.' };

  const { count } = await supabase.from('users').select('id', { count: 'exact' }).eq('team_id', teamId);
  if (count && count >= 6) return { success: false, error: 'This team is already full.' };

  const { data: existing } = await supabase
    .from('team_join_requests')
    .select('id')
    .eq('team_id', teamId)
    .eq('requester_id', userId)
    .eq('status', 'pending')
    .single();
  if (existing) return { success: false, error: 'You already have a pending request for this team.' };

  await supabase.from('team_join_requests').insert({
    team_id: teamId,
    requester_id: userId,
    message: message?.trim() || null,
  });

  revalidatePath('/dashboard');
  return { success: true };
}

export async function respondToJoinRequest(requestId: string, accept: boolean) {
  const { supabase, userId } = await getSupabaseAndUser();

  const { data: request } = await supabase
    .from('team_join_requests')
    .select('*, teams(leader_id, status)')
    .eq('id', requestId)
    .single();
  if (!request) return { success: false, error: 'Request not found.' };

  // @ts-ignore
  if (request.teams?.leader_id !== userId) return { success: false, error: 'Only the team leader can respond.' };
  // @ts-ignore
  if (request.teams?.status === 'finalized') return { success: false, error: 'Team is already finalized.' };

  if (accept) {
    const { data: success, error: rpcError } = await supabase.rpc('atomic_add_team_member', {
      p_team_id: request.team_id,
      p_user_id: request.requester_id,
    });

    if (rpcError) return { success: false, error: rpcError.message };
    if (!success) {
      await supabase.from('team_join_requests').update({ status: 'declined' }).eq('id', requestId);
      return { success: false, error: 'Team is full.' };
    }
    
    await supabase.from('team_join_requests').update({ status: 'accepted' }).eq('id', requestId);
  } else {
    await supabase.from('team_join_requests').update({ status: 'declined' }).eq('id', requestId);
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateTeamName(teamId: string, newName: string) {
  let supabase, userId;
  try {
    const res = await getSupabaseAndUser(teamActionLimiter);
    supabase = res.supabase;
    userId = res.userId;
  } catch (err: any) {
    return { success: false, error: err.message };
  }

  const trimmed = newName.trim();
  if (!trimmed) return { success: false, error: 'Team name cannot be empty.' };
  if (trimmed.length < 3) return { success: false, error: 'Team name must be at least 3 characters.' };
  if (trimmed.length > 50) return { success: false, error: 'Team name cannot exceed 50 characters.' };

  // Check if team exists
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name, leader_id')
    .eq('id', teamId)
    .single();

  if (teamError || !team) return { success: false, error: 'Team not found.' };

  // Check authorization: user must be in the team (or super_admin)
  const { data: user } = await supabase
    .from('users')
    .select('team_id, role')
    .eq('id', userId)
    .single();

  const isMember = user?.team_id === teamId;
  const isAdmin = user?.role === 'super_admin';

  if (!isMember && !isAdmin) {
    return { success: false, error: 'You are not authorized to update this team name.' };
  }

  // Check uniqueness against other teams (case-insensitive)
  const { data: existingTeam } = await supabase
    .from('teams')
    .select('id')
    .ilike('name', trimmed)
    .neq('id', teamId)
    .maybeSingle();

  if (existingTeam) {
    return { success: false, error: 'A team with this name already exists. Please choose another name.' };
  }

  const { error: updateError } = await supabase
    .from('teams')
    .update({ name: trimmed })
    .eq('id', teamId);

  if (updateError) {
    return { success: false, error: updateError.message || 'Failed to update team name.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/phase1');
  revalidatePath('/phase1/dashboard');
  revalidatePath('/admin');
  return { success: true, newName: trimmed };
}
