// One-off CLI to bootstrap the first admin account — there's no self-serve
// "become admin" (unlike become-seller) since that would let anyone grant
// themselves full platform control. Run after the target account has
// already signed up through the normal signup form:
//
//   node server/scripts/promoteAdmin.mjs someone@example.com
import db from '../db/index.js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node server/scripts/promoteAdmin.mjs <email>');
  process.exit(1);
}

const normalizedEmail = email.trim().toLowerCase();
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

if (!user) {
  console.error(`No account found for "${normalizedEmail}". Sign up first, then run this script.`);
  process.exit(1);
}

db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', user.id);
console.log(`"${user.name}" <${user.email}> is now an admin.`);
