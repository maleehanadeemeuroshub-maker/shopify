import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import MagneticButton from '../components/MagneticButton.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import './ResetPassword.css';

// Supabase's password-reset email links back to this page with a recovery
// token in the URL; supabase-js (detectSessionInUrl: true) turns that into a
// short-lived recovery session automatically and fires a PASSWORD_RECOVERY
// auth event — we just wait for that instead of parsing our own token.
export default function ResetPassword() {
  const navigate = useNavigate();
  const { openAuth } = useModal();
  const { updatePassword } = useAuth();

  const [hasRecoverySession, setHasRecoverySession] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setHasRecoverySession(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && hasRecoverySession === null) setHasRecoverySession(Boolean(session));
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hasRecoverySession === null) return null;

  if (!hasRecoverySession) {
    return (
      <div className="reset-password container">
        <div className="reset-password__card reset-password__card--error">
          <ShieldAlert size={32} strokeWidth={1.3} />
          <h1>Invalid or expired reset link</h1>
          <p>This password reset link is invalid or has expired. Request a new one from the login form.</p>
          <MagneticButton
            variant="solid"
            onClick={() => {
              navigate('/');
              openAuth('login');
            }}
          >
            Back to log in
          </MagneticButton>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="reset-password container">
        <div className="reset-password__card">
          <CheckCircle2 size={32} strokeWidth={1.3} color="var(--green)" />
          <h1>Password updated</h1>
          <p>Your password has been changed. You can now log in with your new password.</p>
          <MagneticButton
            variant="solid"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/');
              openAuth('login');
            }}
          >
            Back to log in
          </MagneticButton>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const res = await updatePassword(password);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'This reset link is invalid or has expired.');
      return;
    }
    setDone(true);
  };

  return (
    <div className="reset-password container">
      <div className="reset-password__card">
        <h1>Set a new password</h1>
        <p className="reset-password__sub">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <Lock size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="field__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>

          <label className="field">
            <Lock size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {error && (
            <p className="reset-password__error">
              <AlertCircle size={15} /> {error}
            </p>
          )}

          <MagneticButton type="submit" variant="solid" className="reset-password__submit" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </MagneticButton>
        </form>
      </div>
    </div>
  );
}
