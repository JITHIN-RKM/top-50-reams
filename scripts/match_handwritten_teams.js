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

async function check() {
  const { data: teams } = await supabase.from('teams').select('id, name, leader_id, ps1_id, ps2_id, users!fk_users_team(id, full_name, email, phone_number, branch, year)');
  const { data: p1Regs } = await supabase.from('phase1_registrations').select('team_id');
  const { data: p2Regs } = await supabase.from('phase2_registrations').select('team_id');

  const p1Set = new Set((p1Regs || []).map(r => r.team_id));
  const p2Set = new Set((p2Regs || []).map(r => r.team_id));

  const namesToCheck = [
    'Shouryangas',
    'Siloviki',
    'Arroganz',
    'Needs a name',
    'Apex vision',
    'KABOOM',
    'Cyber coders',
    'Cybercoders',
    'Return_0',
    'Return-0',
    'Return 0',
    'Tech Nova',
    'TechNova',
    'Bharat Builders',
    'The OG-Z',
    'YatraX',
    'Yatra X',
    'BUZZTECH',
    'Smart Miners',
    'Smart miners'
  ];

  console.log('--- Matching teams in DB ---');
  for (const name of namesToCheck) {
    const cleanQuery = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = teams.find(t => t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanQuery);
    if (match) {
      const leader = match.users?.find(u => u.id === match.leader_id);
      console.log(`FOUND: "${match.name}" (ID: ${match.id}) | P1: ${p1Set.has(match.id)} | P2: ${p2Set.has(match.id)} | Leader: ${leader?.full_name} (${leader?.phone_number})`);
    } else {
      console.log(`NOT FOUND: "${name}"`);
    }
  }

  // Also print all team names in DB to see any near matches
  console.log('\nAll Team Names in DB:');
  teams.map(t => t.name).sort().forEach((n, i) => console.log(` ${i + 1}. ${n}`));
}

check();
