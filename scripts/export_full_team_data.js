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

async function exportData() {
  const { data: teams, error: tErr } = await supabase
    .from('teams')
    .select('id, name, leader_id, ps1_id, ps2_id, status, users!fk_users_team(id, full_name, email, phone_number, gender, branch, year)');

  const { data: p1Regs } = await supabase.from('phase1_registrations').select('team_id');
  const { data: p2Regs } = await supabase.from('phase2_registrations').select('team_id');

  const p1TeamIds = new Set((p1Regs || []).map(r => r.team_id));
  const p2TeamIds = new Set((p2Regs || []).map(r => r.team_id));

  function formatTeam(t, category) {
    const leader = t.users?.find(u => u.id === t.leader_id);
    const ps = psMap.get(t.ps1_id) || psMap.get(t.ps2_id);
    return {
      id: t.id,
      name: t.name,
      category,
      leaderName: leader?.full_name || 'N/A',
      leaderEmail: leader?.email || 'N/A',
      leaderPhone: leader?.phone_number || 'N/A',
      leaderBranch: leader?.branch || 'N/A',
      leaderYear: leader?.year || 'N/A',
      membersCount: t.users?.length || 0,
      psId: t.ps1_id || t.ps2_id || 'N/A',
      psTitle: ps?.title || 'Not Selected',
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

  const phase2Teams = [];
  const phase1OnlyTeams = [];
  const neitherTeams = [];

  for (const t of (teams || [])) {
    if (p2TeamIds.has(t.id)) {
      phase2Teams.push(formatTeam(t, 'Phase 2 Registered'));
    } else if (p1TeamIds.has(t.id)) {
      phase1OnlyTeams.push(formatTeam(t, 'Phase 1 Only'));
    } else {
      neitherTeams.push(formatTeam(t, 'Unregistered'));
    }
  }

  phase2Teams.sort((a, b) => a.name.localeCompare(b.name));
  phase1OnlyTeams.sort((a, b) => a.name.localeCompare(b.name));

  const result = {
    exportedAt: new Date().toISOString(),
    totalTeams: teams?.length,
    phase2Count: phase2Teams.length,
    phase1OnlyCount: phase1OnlyTeams.length,
    neitherCount: neitherTeams.length,
    phase2Teams,
    phase1OnlyTeams,
  };

  fs.writeFileSync(path.resolve(process.cwd(), 'src/data/teams_breakdown.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved teams_breakdown.json: ${phase2Teams.length} Phase 2 teams, ${phase1OnlyTeams.length} Phase 1 Only teams.`);
}

exportData();
