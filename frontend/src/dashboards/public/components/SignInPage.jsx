import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import PublicFooter from './PublicFooter';
import PublicNavbar from './PublicNavbar';
import { useAuth } from '../../../services/auth/AuthContext';
import { dashboardPathForRole } from '../../../services/auth/authService';
import './SignInPage.css';

function SignInPage() {
  const { user, loading, login, sessionError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate(dashboardPathForRole(user.role), { replace: true });
  }, [user, navigate]);

  if (user) return <Navigate to={dashboardPathForRole(user.role)} replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setSubmitting(true);
    try {
      const authenticatedUser = await login({ username, password });
      navigate(dashboardPathForRole(authenticatedUser.role), { replace: true });
    } catch (loginError) {
      if (loginError.code === 'INVALID_CREDENTIALS') {
        setError('That username and password don’t match. Check your details and try again.');
      } else {
        setError(loginError.message || 'We couldn’t sign you in right now. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell public-dashboard-page auth-page-shell">
      <PublicNavbar />
      <main className="auth-page-main">
        <section className="auth-card" aria-labelledby="signin-title">
          <Link className="auth-back-link" to="/"><ArrowLeft size={16} /> Back to Skyline</Link>
          <div className="auth-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <path d="M4 30.5 14.5 14l5 7.2 4-5.8L36 30.5H4Z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
              <path d="m12.1 30.5 7.5-11.2 7.8 11.2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".7" />
            </svg>
          </div>
          <p className="auth-eyebrow">Skyline member access</p>
          <h1 id="signin-title">Welcome back</h1>
          <p className="auth-description">Sign in to continue to your Skyline workspace.</p>

          {(sessionError || error) && <p className="auth-error" role="alert">{error || sessionError}</p>}

          <form className="auth-form" onSubmit={submit}>
            <label htmlFor="skyline-username">Username</label>
            <input
              id="skyline-username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              value={username}
              onChange={(change) => { setUsername(change.target.value); setError(''); }}
              placeholder="Enter your username"
              maxLength={80}
              required
              disabled={submitting || loading}
            />

            <label htmlFor="skyline-password">Password</label>
            <div className="auth-password-field">
              <input
                id="skyline-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(change) => { setPassword(change.target.value); setError(''); }}
                placeholder="Enter your password"
                maxLength={256}
                required
                disabled={submitting || loading}
              />
              <button
                className="auth-password-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                disabled={submitting || loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button className="auth-submit-button" type="submit" disabled={submitting || loading}>
              {submitting || loading ? <><LoaderCircle size={17} className="auth-spinner" /> Signing in…</> : <><LockKeyhole size={16} /> Sign In</>}
            </button>
          </form>

          <p className="auth-public-note">New to Skyline? <Link to="/#join">Explore the public site</Link></p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

export default SignInPage;
