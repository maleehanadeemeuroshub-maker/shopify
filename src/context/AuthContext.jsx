import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    authApi.me().then((res) => {
      if (!cancelled && res.ok) setUser(res.user);
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(
    async ({ name, email, password }) => {
      const res = await authApi.signup({ name, email, password });
      if (!res.ok) return { ok: false, error: res.error };

      setUser(res.user);
      showToast(`Welcome, ${res.user.name.split(' ')[0]}! We've sent a confirmation email.`);
      return { ok: true };
    },
    [showToast]
  );

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authApi.login({ email, password });
      if (!res.ok) return { ok: false, error: res.error };

      setUser(res.user);
      showToast('Login successful. A confirmation email has been sent.');
      return { ok: true };
    },
    [showToast]
  );

  const logout = useCallback(() => {
    setUser(null);
    authApi.logout();
  }, []);

  const becomeSeller = useCallback(async () => {
    const res = await authApi.becomeSeller();
    if (!res.ok) return { ok: false, error: res.error };

    setUser(res.user);
    showToast("You're now a seller! Add your first product from the seller dashboard.");
    return { ok: true };
  }, [showToast]);

  const value = useMemo(
    () => ({ user, ready, login, signup, logout, becomeSeller }),
    [user, ready, login, signup, logout, becomeSeller]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
