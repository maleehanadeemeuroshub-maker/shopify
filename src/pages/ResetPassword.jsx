import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';
import MagneticButton from '../components/MagneticButton.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { authApi } from '../lib/api.js';
import './ResetPassword.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { openAuth } = useModal();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="reset-password container">
        <div className="reset-password__card reset-password__card--error">
          <ShieldAlert size={32} strokeWidth={1.3} />
          <h1>Invalid reset link</h1>
          <p>This password reset link is missing its token. Request a new one from the login form.</p>
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
    const res = await authApi.resetPassword({ token, password });
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
