const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdmin() {
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'super_admin' })
    .eq('email', 'www.jithinr2006@gmail.com');
    
  if (error) {
    console.error('Error updating user:', error);
  } else {
    console.log('Successfully upgraded www.jithinr2006@gmail.com to super_admin!');
  }
}

setAdmin();