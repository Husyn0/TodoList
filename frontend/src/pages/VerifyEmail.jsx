import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const status = params.get('status'); // 'success' | 'error' | null
  const { refreshMe } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === 'success') {
      // Refresh /me so emailVerified flips to true and banner disappears
      refreshMe().catch(() => {}).finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (checking) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Verifying…</h1>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Email verified ✅</h1>
          <p>Your email is now confirmed. Welcome aboard.</p>
          <p>
            <Link to="/dashboard">Go to dashboard →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verification failed</h1>
        <p className="error">
          This link is invalid or has expired. Request a new one from Settings.
        </p>
        <p>
          <Link to="/settings">Go to settings</Link> ·{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}