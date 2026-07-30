import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUsingMockData } from '../services/api';

export function LoginPage() {
  const { user, loading, signIn, demoHint } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="login-page">
        <p>Loading…</p>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) setError(err.message || 'Sign in failed');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card__title">MissMigraine Admin</h1>
        <p className="login-card__subtitle">Sign in with your administrator account</p>
        {isUsingMockData() && (
          <p className="login-card__hint">
            Demo mode: use <code>{demoHint}</code> / <code>admin123</code>
          </p>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
