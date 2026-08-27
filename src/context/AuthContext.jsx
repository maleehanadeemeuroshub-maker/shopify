import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { authApi, emailApi } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

function rowToUser(profile) {
  if (!profile) return null;
  return { id: profile.id, email: profile.email, name: profile.full_name || profile.email, role: profile.role, image: profile.avatar_url };
}

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('id,email,full_name,role,avatar_url').eq('id', userId).maybeSingle();
  if (error) {
    console.error('[auth] could not load profile:', error.message);
    return null;
  }
  return rowToUser(data);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const { showToast } = useToast();
  // The profile row is created by a DB trigger right after signUp() resolves —
  // there's a small window where it may not exist yet, so a couple of retries
  // avoids surfacing a false "no account" state to a brand new user.
  const loadProfileWithRetry = useCallback(async (userId, attempts = 5) => {
    for (let i = 0; i < attempts; i += 1) {
      const profile = await fetchProfile(userId);
      if (profile) return profile;
      await new Promise((r) => setTimeout(r, 300));
    }
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await loadProfileWithRetry(session.user.id);
        if (!cancelled) setUser(profile);
      }
      if (!cancelled) setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (!cancelled) setUser(null);
        return;
      }
      const profile = await loadProfileWithRetry(session.user.id);
      if (!cancelled) setUser(profile);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfileWithRetry]);

  const signup = useCallback(
    async ({ name, email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) return { ok: false, error: error.message };
      if (!data.user) return { ok: false, error: 'Could not create account.' };

      const profile = await loadProfileWithRetry(data.user.id);
      setUser(profile);
      showToast(`Welcome, ${name.split(' ')[0]}! We've sent a confirmation email.`);
      emailApi.welcome({ name, email });
      return { ok: true };
    },
    [loadProfileWithRetry, showToast]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: 'Invalid email or password.' };

      const profile = await loadProfileWithRetry(data.user.id);
      setUser(profile);
      showToast('Login successful.');
      emailApi.login({ name: profile?.name, email: data.user.email });
      return { ok: true };
    },
    [loadProfileWithRetry, showToast]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const becomeSeller = useCallback(async () => {
    const res = await authApi.becomeSeller();
    if (!res.ok) return { ok: false, error: res.error };

    setUser(res.user);
    showToast("You're now a seller! Add your first product from the seller dashboard.");
    return { ok: true };
  }, [showToast]);

  const forgotPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Never reveal whether the email exists — Supabase itself doesn't either.
    return { ok: !error };
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, signup, logout, becomeSeller, forgotPassword, updatePassword }),
    [user, ready, login, signup, logout, becomeSeller, forgotPassword, updatePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
