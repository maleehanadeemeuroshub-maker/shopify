import { createClient } from '@supabase/supabase-js';

let client = null;

// Service-role client for use inside /api functions only — never import this
// from src/. The service role key bypasses row-level security, which is fine
// here because these functions are the only thing that talks to Supabase.
export function supabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. See .env.example.');
  }

  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
