import { useEffect, useState } from 'react';
import { settingsApi, authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import TimezoneSelect from '../components/TimezoneSelect';
import { detectTimezone } from '../constants/timezones';

export default function Settings() {
  const { user, emailVerified, setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    theme: 'light',
    timezone: detectTimezone(),
    week_start: 'monday',
  });
  const [pwd, setPwd] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  useEffect(() => {
    settingsApi.getSettings().then(setForm);
  }, []);

  const flash = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 2500);
  };

  // ---- Profile (name, week_start, timezone) ----
  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // Preserve current theme — this form no longer edits it
      const payload = {
        name: form.name,
        theme: user?.theme || form.theme,
        timezone: form.timezone,
        week_start: form.week_start,
      };
      const data = await settingsApi.updateSettings(payload);
      setUser(data.user);
      flash('Profile updated');
    } catch (err) {
      const errors = err.response?.data?.errors;
      flash(errors ? Object.values(errors)[0][0] : 'Update failed', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ---- Theme (immediate) ----
  const setTheme = async (next) => {
    if (next === form.theme) return;
    const prev = form.theme;
    // optimistic: update local state and DOM immediately
    setForm((f) => ({ ...f, theme: next }));
    document.documentElement.setAttribute('data-theme', next);
    setSavingTheme(true);
    try {
      const data = await settingsApi.updateSettings({
        name: form.name,
        theme: next,
        timezone: form.timezone,
        week_start: form.week_start,
      });
      setUser(data.user);
      flash(`Theme set to ${next}`);
    } catch (err) {
      // roll back
      setForm((f) => ({ ...f, theme: prev }));
      document.documentElement.setAttribute('data-theme', prev);
      flash('Could not change theme', 'error');
    } finally {
      setSavingTheme(false);
    }
  };

  // ---- Password ----
  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await settingsApi.updatePassword(pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      flash('Password updated');
    } catch (err) {
      const errors = err.response?.data?.errors;
      flash(
        errors ? Object.values(errors)[0][0] : 'Password update failed',
        'error'
      );
    } finally {
      setSavingPwd(false);
    }
  };

  // ---- Email verification ----
  const resendVerification = async () => {
    setResending(true);
    setVerifyMsg('');
    try {
      const res = await authApi.resendVerification();
      setVerifyMsg(res?.message || 'Verification link sent. Check your inbox.');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setVerifyMsg(
        errors ? Object.values(errors)[0][0] : 'Could not send email.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <h1>Settings</h1>
          <p className="muted">Manage your profile and security preferences.</p>
        </div>
      </header>

      {msg && <div className={`toast ${msgType}`}>{msg}</div>}

      <div className="settings-grid">
        {/* ---------- Email verification ---------- */}
        <section className="settings-card">
          <div className="card-head">
            <h2>Email verification</h2>
            <p className="muted">
              {emailVerified
                ? 'Your email address is confirmed.'
                : 'Confirm your email to secure your account.'}
            </p>
          </div>

          <div className="verify-row">
            <span className="verify-status">
              <span className={`dot ${emailVerified ? 'ok' : 'warn'}`} />
              <span className="verify-email">{user?.email}</span>
            </span>

            {!emailVerified && (
              <button
                type="button"
                className="verify-btn"
                onClick={resendVerification}
                disabled={resending}
              >
                {resending ? 'Sending…' : 'Resend verification'}
              </button>
            )}
          </div>

          {verifyMsg && <p className="verify-msg">{verifyMsg}</p>}
        </section>

        {/* ---------- Appearance (theme) ---------- */}
        <section className="settings-card">
          <div className="card-head">
            <h2>Appearance</h2>
            <p className="muted">Pick how the app looks. Changes save instantly.</p>
          </div>

          <div className="theme-picker">
            <button
              type="button"
              className={`theme-option ${form.theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              disabled={savingTheme}
            >
              <span className="theme-preview theme-preview-light">
                <span className="theme-preview-bar" />
                <span className="theme-preview-line" />
                <span className="theme-preview-line short" />
              </span>
              <span className="theme-label">Light</span>
            </button>

            <button
              type="button"
              className={`theme-option ${form.theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              disabled={savingTheme}
            >
              <span className="theme-preview theme-preview-dark">
                <span className="theme-preview-bar" />
                <span className="theme-preview-line" />
                <span className="theme-preview-line short" />
              </span>
              <span className="theme-label">Dark</span>
            </button>
          </div>
        </section>

        {/* ---------- Profile ---------- */}
        <section className="settings-card">
          <div className="card-head">
            <h2>Profile</h2>
            <p className="muted">Your name and scheduling preferences.</p>
          </div>

          <form onSubmit={saveProfile} className="settings-form">
            <label className="field">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your display name"
              />
            </label>

            <label className="field">
              <span>Week starts on</span>
              <select
                value={form.week_start}
                onChange={(e) =>
                  setForm({ ...form, week_start: e.target.value })
                }
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </label>

            <label className="field">
              <span>Timezone</span>
              <TimezoneSelect
                value={form.timezone}
                onChange={(tz) => setForm({ ...form, timezone: tz })}
              />
            </label>

            <div className="card-actions">
              <button
                type="submit"
                className="btn primary"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        {/* ---------- Change password ---------- */}
        <section className="settings-card">
          <div className="card-head">
            <h2>Change password</h2>
            <p className="muted">
              Use a strong password you don’t reuse elsewhere.
            </p>
          </div>

          <form onSubmit={savePassword} className="settings-form">
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                value={pwd.current_password}
                onChange={(e) =>
                  setPwd({ ...pwd, current_password: e.target.value })
                }
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            <label className="field">
              <span>New password</span>
              <input
                type="password"
                value={pwd.password}
                onChange={(e) =>
                  setPwd({ ...pwd, password: e.target.value })
                }
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>

            <label className="field">
              <span>Confirm new password</span>
              <input
                type="password"
                value={pwd.password_confirmation}
                onChange={(e) =>
                  setPwd({ ...pwd, password_confirmation: e.target.value })
                }
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>

            <div className="card-actions">
              <button
                type="submit"
                className="btn primary"
                disabled={savingPwd}
              >
                {savingPwd ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}