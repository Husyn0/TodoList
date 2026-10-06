import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  const token = params.get('token') || '';
  const emailFromLink = params.get('email') || '';

  const [form, setForm] = useState({
    email: emailFromLink,
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Invalid link</h1>
          <p className="error">
            This password reset link is missing its token. Request a new one.
          </p>
          <p>
            <Link to="/forgot-password">Request new link</Link>
          </p>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      await authApi.resetPassword({
        email: form.email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setDone(true);
      setTimeout(() => nav('/login'), 2000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors)[0][0]
          : err.response?.data?.message || 'Reset failed'
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Password updated</h1>
          <p>Redirecting you to sign in…</p>
          <p>
            <Link to="/login">Sign in now</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Reset password</h1>
        <p className="muted">Choose a new password for your account.</p>
        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="New password"
          required
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          required
          autoComplete="new-password"
          value={form.password_confirmation}
          onChange={(e) =>
            setForm({ ...form, password_confirmation: e.target.value })
          }
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Updating…' : 'Reset password'}
        </button>
        <p>
          <Link to="/login">← Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}