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

async function inspect() {
  const { data: teams, error: tErr } = await supabase
    .from('teams')
    .select('id, name, leader_id, ps1_id, ps2_id, status, users!fk_users_team(id, full_name, email, phone_number, gender, branch, year)');

  const { data: p1Regs } = await supabase.from('phase1_registrations').select('team_id');
  const { data: p2Regs } = await supabase.from('phase2_registrations').select('team_id');

  const p1TeamIds = new Set((p1Regs || []).map(r => r.team_id));
  const p2TeamIds = new Set((p2Regs || []).map(r => r.team_id));

  console.log('Total Teams in DB:', teams?.length);
  console.log('Phase 1 Registered Teams:', p1TeamIds.size);
  console.log('Phase 2 Registered Teams:', p2TeamIds.size);

  const p2Teams = [];
  const p1OnlyTeams = [];
  const neitherTeams = [];

  for (const t of (teams || [])) {
    const isP1 = p1TeamIds.has(t.id);
    const isP2 = p2TeamIds.has(t.id);
    if (isP2) {
      p2Teams.push(t);
    } else if (isP1) {
      p1OnlyTeams.push(t);
    } else {
      neitherTeams.push(t);
    }
  }

  console.log('\n--- Breakdown ---');
  console.log(`[1] Teams registered for Phase 2: ${p2Teams.length}`);
  console.log(`[2] Teams registered for Phase 1 ONLY (didn't register for Phase 2): ${p1OnlyTeams.length}`);
  console.log(`[Other] Teams with neither: ${neitherTeams.length}`);

  console.log('\nList of Phase 1 ONLY teams:');
  p1OnlyTeams.forEach((t, i) => {
    const leader = t.users?.find(u => u.id === t.leader_id);
    console.log(`  ${i + 1}. "${t.name}" | Leader: ${leader?.full_name || 'N/A'} (${leader?.phone_number || 'N/A'})`);
  });
}

inspect();
