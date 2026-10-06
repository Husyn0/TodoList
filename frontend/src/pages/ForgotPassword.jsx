import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api';

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
      <div className="auth-page">
        <div className="auth-card">
          <h1>Check your inbox</h1>
          <p>
            If <strong>{email}</strong> is registered, we’ve sent a password
            reset link. It expires in 60 minutes.
          </p>
          <p>
            Didn’t get it? Check spam, or{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => setSent(false)}
            >
              try another email
            </button>
            .
          </p>
          <p>
            <Link to="/login">← Back to sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Forgot password</h1>
        <p className="muted">
          Enter your account email and we’ll send you a reset link.
        </p>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        <p>
          Remembered it? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}