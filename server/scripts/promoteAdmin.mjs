// One-off CLI to bootstrap the first admin account — there's no self-serve
// "become admin" (unlike become-seller) since that would let anyone grant
// themselves full platform control. Run after the target account has
// already signed up through the normal signup form:
//
//   node server/scripts/promoteAdmin.mjs someone@example.com
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node server/scripts/promoteAdmin.mjs <email>');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example) first.');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const normalizedEmail = email.trim().toLowerCase();

const { data: profile } = await db.from('profiles').select('*').eq('email', normalizedEmail).maybeSingle();
if (!profile) {
  console.error(`No account found for "${normalizedEmail}". Sign up first, then run this script.`);
  process.exit(1);
}

await db.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
console.log(`"${profile.full_name || profile.email}" <${profile.email}> is now an admin.`);
