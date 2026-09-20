import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildPhase2GuidelinesEmail } from '../src/lib/emails/phase2-guidelines-email.ts';

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

// Attachment resolution from public/attachments/
function loadAttachments() {
  const attachments = [];
  const dir = path.resolve(process.cwd(), 'public', 'attachments');
  if (!fs.existsSync(dir)) return attachments;

  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f.toLowerCase().endsWith('.pdf')) {
      const fullPath = path.join(dir, f);
      const content = fs.readFileSync(fullPath);
      // Clean up duplicate extension if named .pdf.pdf
      const cleanName = f.replace(/\.pdf\.pdf$/i, '.pdf');
      attachments.push({
        filename: cleanName,
        content,
      });
      console.log(`📎 Found PDF Attachment: "${cleanName}" (${(content.length / 1024).toFixed(1)} KB)`);
    }
  }
  return attachments;
}

async function main() {
  const isSend = process.argv.includes('--send');

  console.log('\n================================================================');
  console.log('  OUCE SIH 2026 — PHASE 2 GUIDELINES & VENUE DETAILS BROADCAST');
  console.log('================================================================');
  console.log(`Mode: ${isSend ? '🚨 LIVE SENDING via Resend' : '🛡️ DRY RUN (Safe mode, no emails will be sent)'}\n`);

  const attachments = loadAttachments();
  if (attachments.length === 0) {
    console.log('⚠️ Notice: No PDFs found in public/attachments/ yet.');
    console.log('   Place "Internal_SIH_Phase_2_Guidelines_2026.pdf" and the venue details schedule in public/attachments/\n');
  } else {
    console.log(`✅ Loaded ${attachments.length} attachment(s) ready to send.\n`);
  }

  const { data: teams, error: teamsErr } = await supabase
    .from('teams')
    .select('id, name, leader_id, users!fk_users_team(id, full_name, email, phone_number)')
    .order('name', { ascending: true });

  if (teamsErr) {
    console.error('❌ Failed to fetch teams:', teamsErr);
    process.exit(1);
  }

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

  console.log(`Total Teams in Database: ${teams.length}`);
  console.log(`Distinct Team Leaders Found: ${uniqueRecipients.length}\n`);

  if (!isSend) {
    console.log('--- RECIPIENT SAMPLE (First 5) ---');
    uniqueRecipients.slice(0, 5).forEach((r, idx) => {
      console.log(` [${idx + 1}] Team: "${r.teamName}" | Leader: ${r.leaderName} <${r.leaderEmail}>`);
    });
    console.log(`... and ${Math.max(0, uniqueRecipients.length - 5)} more team leaders.`);
    console.log('\nSubject Example:');
    console.log(`Welcome to Internal SIH Phase 2! 🚀 Important Guidelines & Venue Details — ${uniqueRecipients[0]?.teamName || 'Byte Bandits'}\n`);
    console.log('DRY RUN COMPLETE: No emails were sent. Run with --send after user approval.\n');
    return;
  }

  console.log(`🚀 Dispatching emails to ${uniqueRecipients.length} team leaders...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < uniqueRecipients.length; i++) {
    const r = uniqueRecipients[i];
    const subject = `Welcome to Internal SIH Phase 2! 🚀 Important Guidelines & Venue Details — ${r.teamName}`;
    const emailHtml = buildPhase2GuidelinesEmail({
      teamName: r.teamName,
      leaderName: r.leaderName,
      whatsappLink: WHATSAPP_LINK,
    });

    try {
      const payload = {
        from: SENDER_EMAIL,
        to: r.leaderEmail,
        subject,
        html: emailHtml,
      };

      if (attachments.length > 0) {
        payload.attachments = attachments;
      }

      const response = await resend.emails.send(payload);

      if (response.error) {
        console.error(`❌ [${i + 1}/${uniqueRecipients.length}] Failed for ${r.teamName} (${r.leaderEmail}):`, response.error);
        failCount++;
      } else {
        console.log(`✅ [${i + 1}/${uniqueRecipients.length}] Sent to ${r.leaderName} (${r.teamName}) <${r.leaderEmail}> | ID: ${response.data?.id}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/${uniqueRecipients.length}] Error sending to ${r.leaderEmail}:`, err.message || err);
      failCount++;
    }

    await new Promise((res) => setTimeout(res, 120));
  }

  console.log('\n================================================================');
  console.log(`DISPATCH COMPLETED: ${successCount} Successful, ${failCount} Failed`);
  console.log('================================================================\n');
}

main().catch(console.error);
