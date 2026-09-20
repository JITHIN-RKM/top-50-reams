const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables from .env.local if present
if (fs.existsSync('.env.local')) {
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uvxdzzbhqxqbddakbstq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2eGR6emJocXhxYmRkYWtic3RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzczMDE0MywiZXhwIjoyMTAzMzA2MTQzfQ.Do6hFOHFDLnFaPyykknE8YKQvUGuytVTDiTG4kZcGPI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Usage: node scripts/send-whatsapp-reminders.cjs --instance=instanceXXXXX --token=YYYYYY [--send]
const args = process.argv.slice(2);
const instanceArg = args.find(a => a.startsWith('--instance='));
const tokenArg = args.find(a => a.startsWith('--token='));
const isLive = args.includes('--send');

const INSTANCE_ID = instanceArg ? instanceArg.split('=')[1] : process.env.ULTRAMSG_INSTANCE_ID;
const TOKEN = tokenArg ? tokenArg.split('=')[1] : process.env.ULTRAMSG_TOKEN;

function cleanPhoneNumber(rawPhone, rawCode = '+91') {
  if (!rawPhone) return null;
  let digits = (rawCode + ' ' + rawPhone).replace(/[^0-9]/g, '');
  // If user entered +91 twice (e.g. 91918008748155)
  while (digits.startsWith('9191')) {
    digits = digits.slice(2);
  }
  // If digits without 91 is 10 digits
  if (digits.startsWith('91') && digits.length > 12) {
    // Might have extra leading 91
    const sub = digits.slice(2);
    if (sub.length === 10) digits = '91' + sub;
  }
  if (digits.length === 10) {
    digits = '91' + digits;
  }
  return digits;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== WhatsApp Reminder Dispatcher for Unregistered Phase 2 Teams ===');
  console.log(`Mode: ${isLive ? '🔴 LIVE DISPATCH' : '🟡 DRY RUN (Pass --send to dispatch)'}`);

  if (isLive && (!INSTANCE_ID || !TOKEN)) {
    console.error('❌ Error: Missing UltraMsg credentials! Pass --instance=instanceXXXX and --token=YYYYYY');
    process.exit(1);
  }

  const [
    { data: allTeams },
    { data: phase2Regs },
    { data: allUsers }
  ] = await Promise.all([
    supabase.from('teams').select('id, name, leader_id, status, users!fk_users_team(id, full_name, email, phone_number, phone_country_code)'),
    supabase.from('phase2_registrations').select('team_id'),
    supabase.from('users').select('id, full_name, email, phone_number, phone_country_code')
  ]);

  const p2Set = new Set((phase2Regs || []).map(r => r.team_id));
  const userMap = new Map((allUsers || []).map(u => [u.id, u]));

  const unregistered = (allTeams || []).filter(t => !p2Set.has(t.id));
  console.log(`Found ${unregistered.length} unregistered teams in database.\n`);

  const seenPhones = new Set();
  const queue = [];

  for (const t of unregistered) {
    const leader = (t.users || []).find(u => u.id === t.leader_id) || userMap.get(t.leader_id);
    const rawPhone = leader?.phone_number || '';
    const rawCode = leader?.phone_country_code || '+91';
    const phone = cleanPhoneNumber(rawPhone, rawCode);

    if (!phone || phone.length < 11) {
      console.warn(`⚠️ Warning: Invalid/short phone for team "${t.name}" (Leader: ${leader?.full_name}, Phone: ${rawPhone}). Skipping WhatsApp.`);
      continue;
    }

    if (seenPhones.has(phone)) {
      console.log(`ℹ️ Notice: Leader phone +${phone} already in queue. Skipping duplicate.`);
      continue;
    }

    seenPhones.add(phone);

    const leaderFirstName = leader?.full_name ? leader.full_name.trim().split(' ')[0] : 'there';
    const teamName = t.name.trim();

    const message = `Hey ${leaderFirstName}, noticed you formed your team "${teamName}" on the OUCE SIH 2026 portal, but haven't registered for Phase 2.

If you guys are participating, just let me know here by 12 PM today. If not, please reply with why you aren't able to attend!`;

    queue.push({
      teamName,
      leaderName: leader?.full_name || 'Leader',
      leaderEmail: leader?.email || '',
      phone: '+' + phone,
      message
    });
  }

  console.log(`Queued ${queue.length} unique leader WhatsApp numbers:\n`);
  queue.forEach((item, idx) => {
    console.log(`[${idx + 1}/${queue.length}] ${item.leaderName} (${item.teamName}) -> ${item.phone}`);
  });

  if (!isLive) {
    console.log('\nSample Message:');
    console.log('--------------------------------------------------');
    console.log(queue[0]?.message);
    console.log('--------------------------------------------------');
    console.log('\nDry run complete. To send live, run with:');
    console.log(`node scripts/send-whatsapp-reminders.cjs --instance=${INSTANCE_ID || 'YOUR_INSTANCE'} --token=${TOKEN || 'YOUR_TOKEN'} --send\n`);
    return;
  }

  console.log(`\n🚀 Starting live dispatch to ${queue.length} numbers via UltraMsg...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    console.log(`[${i + 1}/${queue.length}] Sending to ${item.leaderName} (${item.phone})...`);

    try {
      const res = await fetch(`https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: TOKEN,
          to: item.phone,
          body: item.message
        }).toString()
      });

      const data = await res.json();
      if (data.sent === 'true' || data.sent === true || data.id) {
        console.log(`  ✅ Sent successfully (ID: ${data.id})`);
        successCount++;
      } else {
        console.error(`  ❌ Failed:`, data);
        failCount++;
      }
    } catch (err) {
      console.error(`  ❌ Network Error:`, err.message || err);
      failCount++;
    }

    if (i < queue.length - 1) {
      await delay(3500);
    }
  }

  console.log('\n=== DISPATCH REPORT ===');
  console.log(`Total Queued: ${queue.length}`);
  console.log(`Successfully Sent: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log('=======================\n');
}

run().catch(console.error);
