import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';

export default function VerificationBanner() {
  const { user, emailVerified, refreshMe } = useAuth();
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [dismissed, setDismissed] = useState(false);

  if (!user || emailVerified || dismissed) return null;

  const resend = async () => {
    setSending(true);
    setMsg('');
    try {
      const res = await authApi.resendVerification();
      setMsg(res?.message || 'Verification link sent.');
      // Re-check after a short delay; the user still has to click the email
      setTimeout(() => refreshMe().catch(() => {}), 500);
    } catch (err) {
      const errors = err.response?.data?.errors;
      setMsg(errors ? Object.values(errors)[0][0] : 'Could not send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verify-banner">
      <span className="verify-text">
        ✉️ Your email isn’t verified. Some features may be limited.
      </span>
      <div className="verify-actions">
        {msg && <span className="verify-msg">{msg}</span>}
        <button
          type="button"
          className="verify-btn"
          onClick={resend}
          disabled={sending}
        >
          {sending ? 'Sending…' : 'Resend email'}
        </button>
        <button
          type="button"
          className="verify-dismiss"
          onClick={() => setDismissed(true)}
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}