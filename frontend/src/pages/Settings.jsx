import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    theme: 'light',
    timezone: 'UTC',
    week_start: 'monday',
  });
  const [pwd, setPwd] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success'); // 'success' | 'error'
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => setForm(res.data));
  }, []);

  const flash = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 2500);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/settings', form);
      setUser(data.user);
      flash('Profile updated');
    } catch (err) {
      const errors = err.response?.data?.errors;
      flash(errors ? Object.values(errors)[0][0] : 'Update failed', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await api.put('/settings/password', pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      flash('Password updated');
    } catch (err) {
      const errors = err.response?.data?.errors;
      flash(errors ? Object.values(errors)[0][0] : 'Password update failed', 'error');
    } finally {
      setSavingPwd(false);
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
        {/* ---------- Profile ---------- */}
        <section className="settings-card">
          <div className="card-head">
            <h2>Profile</h2>
            <p className="muted">Your name, theme and scheduling preferences.</p>
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

            <div className="row">
              <label className="field">
                <span>Theme</span>
                <select
                  value={form.theme}
                  onChange={(e) => setForm({ ...form, theme: e.target.value })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>

              <label className="field">
                <span>Week starts on</span>
                <select
                  value={form.week_start}
                  onChange={(e) => setForm({ ...form, week_start: e.target.value })}
                >
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Timezone</span>
              <input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                placeholder="e.g. Asia/Beirut"
              />
            </label>

            <div className="card-actions">
              <button type="submit" className="btn primary" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        {/* ---------- Change password ---------- */}
        <section className="settings-card">
          <div className="card-head">
            <h2>Change password</h2>
            <p className="muted">Use a strong password you don’t reuse elsewhere.</p>
          </div>

          <form onSubmit={savePassword} className="settings-form">
            <label className="field">
              <span>Current password</span>
              <input
                type="password"
                value={pwd.current_password}
                onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </label>

            <label className="field">
              <span>New password</span>
              <input
                type="password"
                value={pwd.password}
                onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
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
              <button type="submit" className="btn primary" disabled={savingPwd}>
                {savingPwd ? 'Updating…' : 'Update password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}