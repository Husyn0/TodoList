import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api';
import AuthShell from '../components/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(errors ? Object.values(errors)[0][0] : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="auth-card">
          <h1>Check your inbox</h1>
          <p className="auth-sub-inline">
            If <strong>{email}</strong> is registered, we’ve sent a reset link.
            It expires in 60 minutes.
          </p>
          <button
            type="button"
            className="auth-submit auth-submit-ghost"
            onClick={() => setSent(false)}
          >
            Try another email
          </button>
          <p className="auth-meta">
            <Link to="/login">← Back to sign in</Link>
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form className="auth-card" onSubmit={submit}>
        <h1>Forgot password</h1>
        <p className="auth-sub-inline">
          Enter your account email and we’ll send you a reset link.
        </p>
        {error && <p className="error">{error}</p>}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>

        <p className="auth-meta">
          Remembered it? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}