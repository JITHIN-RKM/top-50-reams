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

async function main() {
  const teamQuery = process.argv[2];
  const pdfPath = process.argv[3];

  if (!teamQuery || !pdfPath) {
    console.log('Usage: node scripts/upload-team-pdf.js "<TeamName or TeamId>" "<PathToPDF>"');
    process.exit(1);
  }

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file not found at: ${pdfPath}`);
    process.exit(1);
  }

  // Find team by ID or name
  let { data: team, error } = await supabase
    .from('teams')
    .select('id, name')
    .eq('id', teamQuery)
    .maybeSingle();

  if (!team) {
    const { data: teamsByName } = await supabase
      .from('teams')
      .select('id, name')
      .ilike('name', `%${teamQuery}%`);

    if (!teamsByName || teamsByName.length === 0) {
      console.error(`❌ No team found matching "${teamQuery}"`);
      process.exit(1);
    }
    if (teamsByName.length > 1) {
      console.log('Found multiple teams matching:');
      teamsByName.forEach(t => console.log(` - ${t.name} (${t.id})`));
      console.log('Please be more specific or use team ID.');
      process.exit(1);
    }
    team = teamsByName[0];
  }

  console.log(`Found Team: "${team.name}" (ID: ${team.id})`);

  const fileBuffer = fs.readFileSync(pdfPath);
  console.log(`Uploading PDF (${(fileBuffer.length / 1024).toFixed(1)} KB)...`);

  const { error: uploadErr } = await supabase.storage
    .from('phase2_pdfs')
    .upload(`${team.id}.pdf`, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true,
      cacheControl: '0',
    });

  if (uploadErr) {
    console.error('❌ Upload failed:', uploadErr.message);
    process.exit(1);
  }

  console.log(`✅ SUCCESS! Presentation PDF uploaded for team "${team.name}"!`);
  console.log(`Public URL: ${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/phase2_pdfs/${team.id}.pdf`);
}

main().catch(console.error);
