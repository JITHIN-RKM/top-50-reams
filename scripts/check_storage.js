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
  const { data: regTeams, error: rErr } = await supabase
    .from('phase2_registrations')
    .select('team_id');

  if (rErr) console.error('Registration query error:', rErr);

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, leader_id, users!fk_users_team(id, full_name, email, phone_number)');

  const { data: files } = await supabase.storage.from('phase2_pdfs').list('', { limit: 200 });
  const uploadedTeamIds = new Set(files ? files.map(f => f.name.replace('.pdf', '')) : []);

  console.log('Total Phase 2 Registered Teams:', regTeams?.length);
  console.log('Total Uploaded PDFs in Storage:', uploadedTeamIds.size);

  const teamMap = new Map((teams || []).map(t => [t.id, t]));
  const pending = [];
  for (const r of (regTeams || [])) {
    if (!uploadedTeamIds.has(r.team_id)) {
      const t = teamMap.get(r.team_id);
      const leader = t?.users?.find(u => u.id === t.leader_id);
      pending.push({
        teamId: r.team_id,
        teamName: t?.name,
        leaderName: leader?.full_name,
        leaderPhone: leader?.phone_number,
        leaderEmail: leader?.email,
      });
    }
  }

  console.log(`\nPending Teams without PDF (${pending.length} teams):`);
  pending.forEach((p, idx) => {
    console.log(`[${idx + 1}] Team: "${p.teamName}" | Leader: ${p.leaderName} (${p.leaderPhone}) | ID: ${p.teamId}`);
  });
}
check();
