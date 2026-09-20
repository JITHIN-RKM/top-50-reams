import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load .env.local manually if not in process.env
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const psData = JSON.parse(fs.readFileSync('./src/data/sih-2026-data.json', 'utf8'));

const sanitizeCSVField = (field) => {
  if (field == null) return '""';
  const str = String(field).trim();
  const sanitized = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${sanitized.replace(/"/g, '""')}"`;
};

const CRITERIA = [
  'Novelty / Originality',
  'Complexity & Technical Challenge',
  'Clarity & Format Completeness',
  'Feasibility',
  'Practicability & Ease of Implementation',
  'Sustainability',
  'Scale of Impact',
  'User Experience (UX)',
  'Potential for Future Work & Scalability',
];

async function generateCSVs() {
  console.log('Fetching Phase 1 registrations...');
  const { data: phase1Regs, error: regError } = await supabase
    .from('phase1_registrations')
    .select('*')
    .order('created_at', { ascending: true });

  if (regError) {
    console.error('Error fetching registrations:', regError);
    return;
  }

  const teamIds = phase1Regs.map((r) => r.team_id);
  const { data: teams, error: teamError } = await supabase
    .from('teams')
    .select('*, users!fk_users_team(id, full_name, email, branch, year, phone_number)')
    .in('id', teamIds);

  if (teamError) {
    console.error('Error fetching teams:', teamError);
    return;
  }

  const teamsMap = new Map(teams.map((t) => [t.id, t]));
  const orderedTeams = phase1Regs.map((r) => teamsMap.get(r.team_id)).filter(Boolean);

  console.log(`Processing ${orderedTeams.length} Phase 1 registered teams...`);

  // ==========================================
  // 1) attendance_sheet.csv
  // Columns: sno, team name, team members name, signature
  // ==========================================

  // Format A: Per-member detailed sign-in sheet (the standard physical attendance sheet for pitches)
  let attMemberRows = ['"sno","team name","team members name","signature"'];
  let memberSno = 1;

  for (let tIdx = 0; tIdx < orderedTeams.length; tIdx++) {
    const t = orderedTeams[tIdx];
    const users = t.users || [];
    const sortedUsers = [...users].sort((a, b) => (a.id === t.leader_id ? -1 : b.id === t.leader_id ? 1 : 0));

    for (const u of sortedUsers) {
      const isLeader = u.id === t.leader_id;
      const memberLabel = isLeader ? `${u.full_name} (Team Leader)` : u.full_name;
      attMemberRows.push(
        [memberSno++, t.name, memberLabel, ''].map(sanitizeCSVField).join(',')
      );
    }
  }
  fs.writeFileSync('attendance_sheet.csv', attMemberRows.join('\n'), 'utf8');

  // Format B: Per-team summary attendance sheet
  let attTeamRows = ['"sno","team name","team members name","signature"'];
  for (let tIdx = 0; tIdx < orderedTeams.length; tIdx++) {
    const t = orderedTeams[tIdx];
    const users = t.users || [];
    const sortedUsers = [...users].sort((a, b) => (a.id === t.leader_id ? -1 : b.id === t.leader_id ? 1 : 0));
    const memberNamesStr = sortedUsers
      .map((u, i) => `${i + 1}. ${u.full_name}${u.id === t.leader_id ? ' (Leader)' : ''}`)
      .join('; ');

    attTeamRows.push(
      [tIdx + 1, t.name, memberNamesStr, ''].map(sanitizeCSVField).join(',')
    );
  }
  fs.writeFileSync('attendance_sheet_by_team.csv', attTeamRows.join('\n'), 'utf8');

  // ==========================================
  // 2) scoring_sheet.csv & scorin_sheet.csv
  // columns -> sno, team name, team ps id and title selected, 9 criteria, total for (100)
  // ==========================================
  const scoreHeaders = [
    'sno',
    'team name',
    'team ps id and title selected',
    ...CRITERIA,
    'total for (100)',
  ];

  let scoreRows = [scoreHeaders.map(sanitizeCSVField).join(',')];

  for (let tIdx = 0; tIdx < orderedTeams.length; tIdx++) {
    const t = orderedTeams[tIdx];
    const ps = psData.find((p) => p.id === t.ps1_id);
    const psTitle = ps ? `${t.ps1_id} - ${ps.title}` : t.ps1_id ? t.ps1_id : 'Not Selected';

    const row = [
      tIdx + 1,
      t.name,
      psTitle,
      '', // Novelty / Originality
      '', // Complexity & Technical Challenge
      '', // Clarity & Format Completeness
      '', // Feasibility
      '', // Practicability & Ease of Implementation
      '', // Sustainability
      '', // Scale of Impact
      '', // User Experience (UX)
      '', // Potential for Future Work & Scalability
      '', // total for (100)
    ];

    scoreRows.push(row.map(sanitizeCSVField).join(','));
  }
  fs.writeFileSync('scoring_sheet.csv', scoreRows.join('\n'), 'utf8');
  fs.writeFileSync('scorin_sheet.csv', scoreRows.join('\n'), 'utf8');

  // ==========================================
  // 3) registered_teams.csv
  // columns -> sno, team name, team leader, are/did you presenting in phase 1, interest for phase 2
  // ==========================================
  const regHeaders = [
    'sno',
    'team name',
    'team leader',
    'are/did you presenting in phase 1',
    'interest for phase 2',
  ];

  let regRows = [regHeaders.map(sanitizeCSVField).join(',')];

  for (let tIdx = 0; tIdx < orderedTeams.length; tIdx++) {
    const t = orderedTeams[tIdx];
    const leader = (t.users || []).find((u) => u.id === t.leader_id);
    const leaderName = leader?.full_name || 'Unknown';

    const row = [
      tIdx + 1,
      t.name,
      leaderName,
      '', // are/did you presenting in phase 1 (leave blank)
      '', // interest for phase 2 (leave blank)
    ];

    regRows.push(row.map(sanitizeCSVField).join(','));
  }
  fs.writeFileSync('registered_teams.csv', regRows.join('\n'), 'utf8');

  console.log('✅ Generated 3 CSV files successfully:');
  console.log(' - attendance_sheet.csv (per member)');
  console.log(' - attendance_sheet_by_team.csv (per team)');
  console.log(' - scoring_sheet.csv (and scorin_sheet.csv)');
  console.log(' - registered_teams.csv');
}

generateCSVs();
