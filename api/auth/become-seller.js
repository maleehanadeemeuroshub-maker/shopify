import { requireAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { methodNotAllowed } from '../_lib/validate.js';

// Self-serve upgrade — this practice storefront has no seller approval
// workflow, so any customer can start selling immediately.
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const user = await requireAuth(req, res);
  if (!user) return;

  const db = supabaseAdmin();
  if (user.role === 'customer') {
    await db.from('profiles').update({ role: 'seller' }).eq('id', user.id);
  }
  const { data: updated } = await db.from('profiles').select('id,email,full_name,role,avatar_url').eq('id', user.id).single();

  res.json({ ok: true, user: { id: updated.id, email: updated.email, name: updated.full_name, role: updated.role, image: updated.avatar_url } });
}
