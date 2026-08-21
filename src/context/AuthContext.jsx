import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { emailApi } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

const ACCOUNTS_KEY = 'genzwears_accounts';
const SESSION_KEY = 'genzwears_session';

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore corrupt session */
    }
    setReady(true);
  }, []);

  const signup = useCallback(
    ({ name, email, password }) => {
      const accounts = readAccounts();
      const exists = accounts.some((a) => a.email.toLowerCase() === email.toLowerCase());
      if (exists) return { ok: false, error: 'An account with this email already exists.' };

      const accountRecord = { name, email, password };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, accountRecord]));

      const session = { name, email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);

      // Fire-and-forget: a slow/broken email API must never affect signup itself.
      emailApi.welcome({ name, email });
      showToast(`Welcome, ${name.split(' ')[0]}! We've sent a confirmation email.`);

      return { ok: true };
    },
    [showToast]
  );

  const login = useCallback(
    ({ email, password }) => {
      const accounts = readAccounts();
      const match = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      if (!match || match.password !== password) {
        return { ok: false, error: 'Invalid email or password.' };
      }
      const session = { name: match.name, email: match.email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);

      emailApi.login({
        name: match.name,
        email: match.email,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: Date.now(),
      });
      showToast('Login successful. A confirmation email has been sent.');

      return { ok: true };
    },
    [showToast]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
