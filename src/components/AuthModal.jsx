import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Modal from './Modal.jsx';
import MagneticButton from './MagneticButton.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './AuthModal.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal() {
  const { modal, openAuth, closeModal } = useModal();
  const { login, signup } = useAuth();

  const isOpen = modal === 'login' || modal === 'signup';
  const mode = modal === 'signup' ? 'signup' : 'login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    setForgotOpen(false);
  }, [isOpen, mode]);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirm('');
    setShowPassword(false);
  };

  const handleClose = () => {
    closeModal();
    window.setTimeout(resetFields, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Enter your name.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
      const res = signup({ name: name.trim(), email, password });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`Welcome, ${name.trim()}! Your store is ready.`);
    } else {
      const res = login({ email, password });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess('Welcome back!');
    }

    window.setTimeout(handleClose, 900);
  };

  return (
    <Modal open={isOpen} onClose={handleClose} labelledBy="auth-modal-title">
      <div className="auth-modal">
        <div className="auth-modal__tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => openAuth('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => openAuth('signup')}
          >
            Sign up
          </button>
        </div>

        <h2 id="auth-modal-title">{mode === 'signup' ? 'Create your store' : 'Welcome back'}</h2>
        <p className="auth-modal__sub">
          {mode === 'signup'
            ? 'Start selling with GENZ-WEARS in minutes.'
            : 'Log in to keep building your store.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <label className="field">
              <User size={16} />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}

          <label className="field">
            <Mail size={16} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="field">
            <Lock size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

          {mode === 'signup' && (
            <label className="field">
              <Lock size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          )}

          {mode === 'login' && (
            <button type="button" className="auth-modal__forgot" onClick={() => setForgotOpen((v) => !v)}>
              Forgot password?
            </button>
          )}
          {forgotOpen && (
            <p className="auth-modal__hint">
              This is a demo store — password resets aren&apos;t wired up to email yet.
            </p>
          )}

          {error && (
            <p className="auth-modal__error">
              <AlertCircle size={15} /> {error}
            </p>
          )}
          {success && (
            <p className="auth-modal__success">
              <CheckCircle2 size={15} /> {success}
            </p>
          )}

          <MagneticButton type="submit" variant="solid" className="auth-modal__submit">
            {mode === 'signup' ? 'Create account' : 'Log in'}
          </MagneticButton>
        </form>

        <p className="auth-modal__switch">
          {mode === 'signup' ? (
            <>
              Already have a store?{' '}
              <button type="button" onClick={() => openAuth('login')}>
                Log in
              </button>
            </>
          ) : (
            <>
              New to GENZ-WEARS?{' '}
              <button type="button" onClick={() => openAuth('signup')}>
                Sign up
              </button>
            </>
          )}
        </p>

        <p className="auth-modal__disclaimer">Demo authentication — stored locally in your browser only.</p>
      </div>
    </Modal>
  );
}
