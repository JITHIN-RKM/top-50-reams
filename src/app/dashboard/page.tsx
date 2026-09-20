import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import psDataRaw from '@/data/sih-2026-data.json';

export const dynamic = 'force-dynamic';

const ALL_PS = psDataRaw as any[];

// Tab components (server components - render once)
import InternalHackathonTab from './tabs/InternalHackathonTab';
import AllAboutSIHTab from './tabs/AllAboutSIHTab';
import TeamTab from './tabs/TeamTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';
import ProfileTab from './tabs/ProfileTab';

// Client shell for instant tab switching
import DashboardShell from './DashboardShell';
import { TeamBanner } from '@/components/dashboard/TeamBanner';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  try {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const supabase = createAdminClient();

    // Ensure user has completed onboarding
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, email, roll_number, branch, year, phone_country_code, phone_number, gender, onboarding_complete, team_id, role')
      .eq('id', userId)
      .single();

    if (!user || !user.onboarding_complete) {
      redirect('/onboarding');
    }

    const isSuperAdmin = user.role === 'super_admin';

    // Fetch full team data if they have one
    let teamData = null;
    let members: any[] = [];
    let joinRequests: any[] = [];
    let psTitles = { ps1: '', ps2: '' };

    if (user.team_id) {
      const { data: team } = await supabase.from('teams').select('*').eq('id', user.team_id).single();
      teamData = team;
      if (team) {
        if (team.ps1_id) psTitles.ps1 = ALL_PS.find(ps => ps.id === team.ps1_id)?.title || '';
        if (team.ps2_id) psTitles.ps2 = ALL_PS.find(ps => ps.id === team.ps2_id)?.title || '';

        const { data: teamMembers } = await supabase.from('users').select('*').eq('team_id', team.id);
        members = teamMembers || [];

        if (team.leader_id === userId) {
          const { data: reqs } = await supabase
            .from('team_join_requests')
            .select('id, status, created_at, message, users(full_name, branch, year, gender)')
            .eq('team_id', team.id)
            .eq('status', 'pending');
          joinRequests = reqs || [];
        }
      }
    }

    // Fetch Open Teams if user has no team
    let openTeams: any[] = [];
    if (!user.team_id) {
      const { data: ot } = await supabase
        .from('teams')
        .select('id, name, created_at, leader_id, open_slot_requirement, users!fk_users_team(id, full_name, branch, year, phone_number, phone_country_code)')
        .eq('status', 'open_for_members');
      openTeams = (ot || []).filter(t => (t.users?.length || 0) < 6);
    }

    // Check phase registrations to pass status to InternalHackathonTab
    let isPhase1Registered = false;
    let isPhase2Registered = false;
    if (user.team_id) {
      const [phase1Reg, phase2Reg] = await Promise.all([
        supabase.from('phase1_registrations').select('id').eq('team_id', user.team_id).maybeSingle(),
        supabase.from('phase2_registrations').select('id').eq('team_id', user.team_id).maybeSingle(),
      ]);
      isPhase1Registered = !!phase1Reg.data;
      isPhase2Registered = !!phase2Reg.data;
    }

    const { tab } = await searchParams;
    const initialTab = tab || 'internal-hackathon';

    // Team banner for persistent status display with Change Team Name option
    const teamBanner = teamData ? (
      <TeamBanner team={teamData} clerkId={userId} />
    ) : null;

    return (
      <DashboardShell
        initialTab={initialTab}
        teamBanner={teamBanner}
        adminShortcut={isSuperAdmin}
        internalHackathonContent={
          <InternalHackathonTab
            isPhase1Registered={isPhase1Registered}
            isPhase2Registered={isPhase2Registered}
          />
        }
        allAboutSIHContent={<AllAboutSIHTab />}
        teamContent={
          <TeamTab
            user={user}
            team={teamData}
            members={members}
            clerkId={userId}
            openTeams={openTeams}
            joinRequests={joinRequests}
            psTitles={psTitles}
          />
        }
        announcementsContent={<AnnouncementsTab />}
        profileContent={<ProfileTab initialUser={user} />}
      />
    );
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT' || err?.digest === 'DYNAMIC_SERVER_USAGE') throw err;
    console.error("DashboardPage Error:", err);
    throw err;
  }
}
