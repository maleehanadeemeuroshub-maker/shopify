import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set. See .env.example.');
}

// Single browser client — session (access/refresh tokens) is persisted to
// localStorage and refreshed automatically, which is what keeps the user
// logged in across a page refresh.
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
