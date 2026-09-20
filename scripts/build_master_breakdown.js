import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[trimmed.slice(0, eqIdx).trim()] = val;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const psDataRaw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'src/data/sih-2026-data.json'), 'utf8'));
const psMap = new Map((psDataRaw || []).map(p => [p.id, p]));

async function buildMasterData() {
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, leader_id, ps1_id, ps2_id, status, users!fk_users_team(id, full_name, email, phone_number, gender, branch, year)');

  const { data: p1Regs } = await supabase.from('phase1_registrations').select('team_id');
  const { data: p2Regs } = await supabase.from('phase2_registrations').select('team_id');

  const p1TeamIds = new Set((p1Regs || []).map(r => r.team_id));
  const p2TeamIds = new Set((p2Regs || []).map(r => r.team_id));

  function cleanName(n) {
    return (n || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  const teamMapByClean = new Map();
  for (const t of (teams || [])) {
    teamMapByClean.set(cleanName(t.name), t);
  }

  function formatTeam(t, category, subStatus = '') {
    if (!t) return null;
    const leader = t.users?.find(u => u.id === t.leader_id);
    const ps = psMap.get(t.ps1_id) || psMap.get(t.ps2_id);
    return {
      id: t.id,
      name: t.name,
      category,
      subStatus,
      leaderName: leader?.full_name || 'N/A',
      leaderEmail: leader?.email || 'N/A',
      leaderPhone: leader?.phone_number || 'N/A',
      leaderBranch: leader?.branch || 'N/A',
      leaderYear: leader?.year || 'N/A',
      membersCount: t.users?.length || 0,
      psId: t.ps1_id || t.ps2_id || 'N/A',
      psTitle: ps?.title || 'Not Selected',
      psCategory: ps?.category || 'General',
      psDomain: ps?.domain_bucket || ps?.theme || 'Software',
      members: (t.users || []).map(u => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        phone: u.phone_number,
        gender: u.gender,
        branch: u.branch,
        year: u.year,
        isLeader: u.id === t.leader_id
      }))
    };
  }

  // 1. Eliminated Teams (10 teams from evaluation sheet)
  const eliminatedNames = [
    'Shouryangas',
    'Siloviki',
    'Arroganz',
    'Needs a name',
    'Apex Vision',
    'KABOOM',
    'CyberCoders',
    'Return_0',
    'TechNova',
    'Bharat Builders'
  ];

  const eliminatedTeams = eliminatedNames.map((name, idx) => {
    const found = teamMapByClean.get(cleanName(name));
    const formatted = formatTeam(found, 'Eliminated', 'Eliminated');
    return {
      ...(formatted || {
        id: `elim-${idx}`,
        name,
        category: 'Eliminated',
        subStatus: 'Eliminated',
        leaderName: 'N/A',
        leaderEmail: 'N/A',
        leaderPhone: 'N/A',
        leaderBranch: 'N/A',
        leaderYear: 'N/A',
        membersCount: 6,
        psId: 'N/A',
        psTitle: 'N/A',
        psCategory: 'General',
        psDomain: 'General',
        members: []
      }),
      eliminatedRank: idx + 1
    };
  });

  // 2. Waiting List Teams (5 teams from evaluation sheet)
  const waitlistNames = [
    'The OG-Z',
    'YatraX',
    'BUZZTECH',
    'CyberCoders',
    'Smart miners'
  ];

  const waitlistTeams = waitlistNames.map((name, idx) => {
    const found = teamMapByClean.get(cleanName(name));
    const formatted = formatTeam(found, 'Waiting List', `Waitlist Rank #${idx + 1}`);
    return {
      ...(formatted || {
        id: `wl-${idx}`,
        name,
        category: 'Waiting List',
        subStatus: `Waitlist Rank #${idx + 1}`,
        leaderName: 'N/A',
        leaderEmail: 'N/A',
        leaderPhone: 'N/A',
        leaderBranch: 'N/A',
        leaderYear: 'N/A',
        membersCount: 6,
        psId: 'N/A',
        psTitle: 'N/A',
        psCategory: 'General',
        psDomain: 'General',
        members: []
      }),
      waitlistRank: idx + 1
    };
  });

  // 3. Top Shortlisted Candidates
  const elimCleanSet = new Set(eliminatedNames.map(cleanName));
  const waitCleanSet = new Set(waitlistNames.map(cleanName));

  const allEligibleTeams = [];
  for (const t of (teams || [])) {
    const isP2 = p2TeamIds.has(t.id);
    const isP1 = p1TeamIds.has(t.id);
    if (!isP2 && !isP1) continue;

    const cName = cleanName(t.name);
    if (elimCleanSet.has(cName) || waitCleanSet.has(cName)) continue;

    allEligibleTeams.push(formatTeam(t, isP2 ? 'Phase 2 Registered' : 'Phase 1 Only'));
  }

  const p2Eligible = allEligibleTeams.filter(t => t.category === 'Phase 2 Registered');
  p2Eligible.sort((a, b) => a.name.localeCompare(b.name));

  const p1Eligible = allEligibleTeams.filter(t => t.category === 'Phase 1 Only');
  p1Eligible.sort((a, b) => a.name.localeCompare(b.name));

  // 44 Phase 2 teams + top 3 Phase 1 teams = 47 Top Shortlisted Teams
  const top47Teams = [...p2Eligible, ...p1Eligible.slice(0, 3)].map((t, idx) => ({
    ...t,
    category: 'Top Shortlisted',
    subStatus: 'Shortlisted',
    shortlistRank: idx + 1
  }));

  // Candidate #48 Alternate (TECHTITANS)
  const candidate48Teams = p1Eligible.slice(3).map((t) => ({
    ...t,
    category: 'Top Shortlisted (Alternate)',
    subStatus: 'Shortlisted (Alternate)',
    shortlistRank: 48
  }));

  const masterData = {
    generatedAt: new Date().toISOString(),
    counts: {
      top47Count: top47Teams.length,
      targetFinalCount: 45,
      waitlistCount: waitlistTeams.length,
      eliminatedCount: eliminatedTeams.length,
      totalTeamsEvaluated: 62,
    },
    top47Teams,
    candidate48Teams,
    waitlistTeams,
    eliminatedTeams,
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), 'src/data/teams_breakdown.json'),
    JSON.stringify(masterData, null, 2),
    'utf8'
  );

  console.log('✅ Generated master teams_breakdown.json successfully with full member lists:');
  console.log(` - Top Shortlisted (Target 45 pool): ${top47Teams.length}`);
  console.log(` - Waiting List: ${waitlistTeams.length}`);
  console.log(` - Eliminated: ${eliminatedTeams.length}`);
}

buildMasterData();
