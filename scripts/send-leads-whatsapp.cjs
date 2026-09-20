const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const args = process.argv.slice(2);
const instanceArg = args.find(a => a.startsWith('--instance='));
const tokenArg = args.find(a => a.startsWith('--token='));
const isLive = args.includes('--send');

const INSTANCE_ID = instanceArg ? instanceArg.split('=')[1] : (process.env.ULTRAMSG_INSTANCE_ID || 'instance191592');
const TOKEN = tokenArg ? tokenArg.split('=')[1] : (process.env.ULTRAMSG_TOKEN || 'fktgj2u4cj008kil');

function cleanPhoneNumber(rawPhone, rawCode = '+91') {
  if (!rawPhone) return null;
  let digits = (rawCode + ' ' + rawPhone).replace(/[^0-9]/g, '');
  while (digits.startsWith('9191')) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('91') && digits.length > 12) {
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

function formatFirstName(fullName) {
  if (!fullName) return 'there';
  const clean = fullName.trim().replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, '');
  const parts = clean.split(/\s+/);
  let first = parts[0];
  if (first.length <= 2 && parts.length > 1) {
    first = parts[1];
  }
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

async function run() {
  console.log('=== WhatsApp Team Leads Group Broadcast ===');
  console.log(`Mode: ${isLive ? '🔴 LIVE DISPATCH' : '🟡 DRY RUN (Pass --send to dispatch)'}`);

  const [
    { data: allTeams, error: tErr },
    { data: allUsers, error: uErr }
  ] = await Promise.all([
    supabase.from('teams').select('id, name, leader_id').order('name', { ascending: true }),
    supabase.from('users').select('id, full_name, email, phone_number, phone_country_code')
  ]);

  if (tErr || uErr) {
    console.error('Error fetching database records:', tErr || uErr);
    process.exit(1);
  }

  const userMap = new Map((allUsers || []).map(u => [u.id, u]));

  const seenPhones = new Set();
  const queue = [];

  for (const t of allTeams) {
    const leader = userMap.get(t.leader_id);
    const rawPhone = leader?.phone_number || '';
    const rawCode = leader?.phone_country_code || '+91';
    const phone = cleanPhoneNumber(rawPhone, rawCode);

    if (!phone || phone.length < 11) {
      console.warn(`⚠️ Warning: Invalid/short phone for team "${t.name}" (Leader: ${leader?.full_name}, Phone: ${rawPhone}).`);
      continue;
    }

    if (seenPhones.has(phone)) {
      continue;
    }

    seenPhones.add(phone);

    const firstName = formatFirstName(leader?.full_name);

    // Natural, casual, human tone from Jithin's WhatsApp
    const message = `Hey ${firstName}, Jithin here. Since the SIH pitching is tomorrow, make sure you join the team leads WhatsApp group if you haven't yet — all the slot timings and pitching order will only be posted there:
https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV`;

    queue.push({
      teamName: t.name,
      leaderName: leader?.full_name || 'Leader',
      leaderEmail: leader?.email || '',
      phone: '+' + phone,
      message
    });
  }

  console.log(`Total Teams in DB: ${allTeams.length}`);
  console.log(`Queued Distinct Leaders: ${queue.length} phone numbers\n`);

  if (!isLive) {
    console.log('Sample Message for Leader:');
    console.log('--------------------------------------------------');
    console.log(queue[0]?.message);
    console.log('--------------------------------------------------\n');
    console.log('Recipients (First 5):');
    queue.slice(0, 5).forEach((item, idx) => {
      console.log(` [${idx + 1}] ${item.leaderName} (${item.teamName}) -> ${item.phone}`);
    });
    console.log(`... and ${queue.length - 5} more leaders.\n`);
    console.log('DRY RUN COMPLETE: Run with --send to dispatch.\n');
    return;
  }

  console.log(`🚀 Dispatching messages to ${queue.length} team leaders via UltraMsg...\n`);

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
        console.log(`  ✅ Sent (ID: ${data.id})`);
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
