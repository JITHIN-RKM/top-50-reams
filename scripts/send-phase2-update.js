import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildPhase2BroadcastEmail } from '../src/lib/emails/phase2-broadcast-email.ts';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

if (!resendApiKey) {
  console.error('❌ Missing RESEND_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const WHATSAPP_LINK = 'https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV';
const SENDER_EMAIL = 'OUCE SIH 2026 <updates@sih-ouce.meetthealtezza.tech>';

async function main() {
  const isSend = process.argv.includes('--send');

  console.log('\n======================================================');
  console.log('  OUCE SIH 2026 — PHASE 2 SCHEDULE BROADCAST DISPATCHER');
  console.log('======================================================');
  console.log(`Mode: ${isSend ? '🚨 LIVE SENDING via Resend' : '🛡️ DRY RUN (Safe mode, no emails will be sent)'}\n`);

  const { data: teams, error: teamsErr } = await supabase
    .from('teams')
    .select('id, name, leader_id, users!fk_users_team(id, full_name, email, phone_number)')
    .order('name', { ascending: true });

  if (teamsErr) {
    console.error('❌ Failed to fetch teams:', teamsErr);
    process.exit(1);
  }

  const { data: registrations, error: regErr } = await supabase
    .from('phase2_registrations')
    .select('team_id');

  if (regErr) {
    console.error('❌ Failed to fetch registrations:', regErr);
    process.exit(1);
  }

  const regSet = new Set((registrations || []).map((r) => r.team_id));
  const registeredCount = regSet.size;
  const totalTeams = teams.length;

  const recipients = [];
  for (const team of teams) {
    const users = team.users || [];
    const leader = users.find((u) => u.id === team.leader_id);
    if (leader && leader.email) {
      recipients.push({
        teamId: team.id,
        teamName: team.name,
        leaderName: leader.full_name || 'Team Leader',
        leaderEmail: leader.email.trim().toLowerCase(),
        phone: leader.phone_number || '',
        isRegistered: regSet.has(team.id),
      });
    }
  }

  const uniqueRecipients = [];
  const seenEmails = new Set();
  for (const r of recipients) {
    if (!seenEmails.has(r.leaderEmail)) {
      seenEmails.add(r.leaderEmail);
      uniqueRecipients.push(r);
    }
  }

  const registeredLeaders = uniqueRecipients.filter((r) => r.isRegistered).length;
  const unregisteredLeaders = uniqueRecipients.filter((r) => !r.isRegistered).length;

  console.log(`Total Teams in Database: ${teams.length}`);
  console.log(`Phase 2 Registered Teams: ${registeredCount}`);
  console.log(`Unregistered Teams: ${totalTeams - registeredCount}`);
  console.log(`Distinct Team Leaders Found: ${uniqueRecipients.length}`);
  console.log(` - Registered Leaders: ${registeredLeaders}`);
  console.log(` - Unregistered Leaders: ${unregisteredLeaders}\n`);

  if (!isSend) {
    console.log('--- RECIPIENT SAMPLE (First 6) ---');
    uniqueRecipients.slice(0, 6).forEach((r, idx) => {
      const statusBadge = r.isRegistered ? '✅ REGISTERED' : '⚠️ UNREGISTERED';
      console.log(` [${idx + 1}] [${statusBadge}] Team: "${r.teamName}" | Leader: ${r.leaderName} <${r.leaderEmail}>`);
    });
    console.log(`... and ${Math.max(0, uniqueRecipients.length - 6)} more team leaders.`);
    console.log('\nSubject Example:');
    console.log(`🚨 [SIH 2026] Phase 2 Pitching is Tomorrow (16 Sept) — ${uniqueRecipients[0]?.teamName || 'Byte Bandits'}\n`);
    console.log('DRY RUN COMPLETE: No emails were sent. Run with --send after user approval.\n');
    return;
  }

  console.log(`🚀 Dispatching emails to ${uniqueRecipients.length} team leaders...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < uniqueRecipients.length; i++) {
    const r = uniqueRecipients[i];
    const subject = `🚨 [SIH 2026] Phase 2 Pitching is Tomorrow (16 Sept) — ${r.teamName}`;
    const emailHtml = buildPhase2BroadcastEmail({
      teamName: r.teamName,
      leaderName: r.leaderName,
      isRegistered: r.isRegistered,
      registeredCount,
      totalTeams,
      whatsappLink: WHATSAPP_LINK,
    });

    try {
      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: r.leaderEmail,
        subject,
        html: emailHtml,
      });

      if (response.error) {
        console.error(`❌ [${i + 1}/${uniqueRecipients.length}] Failed for ${r.teamName} (${r.leaderEmail}):`, response.error);
        failCount++;
      } else {
        console.log(`✅ [${i + 1}/${uniqueRecipients.length}] [${r.isRegistered ? 'Reg' : 'Unreg'}] Sent to ${r.leaderName} (${r.teamName}) <${r.leaderEmail}> | ID: ${response.data?.id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/${uniqueRecipients.length}] Error sending to ${r.leaderEmail}:`, err.message || err);
      failCount++;
    }

    await new Promise((res) => setTimeout(res, 120));
  }

  console.log('\n======================================================');
  console.log(`DISPATCH COMPLETED: ${successCount} Successful, ${failCount} Failed`);
  console.log('======================================================\n');
}

main().catch(console.error);
