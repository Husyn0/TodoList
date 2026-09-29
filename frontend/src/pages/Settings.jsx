import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: '', theme: 'light', timezone: 'UTC', week_start: 'monday' });
  const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/settings').then((res) => setForm(res.data));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/settings', form);
    setUser(data.user);
    setMsg('Profile updated');
    setTimeout(() => setMsg(''), 2000);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings/password', pwd);
      setMsg('Password updated');
      setPwd({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      {msg && <div className="toast">{msg}</div>}

      <section>
        <h2>Profile</h2>
        <form onSubmit={saveProfile}>
          <label>Name <input value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Theme
            <select value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>Week starts on
            <select value={form.week_start}
              onChange={(e) => setForm({ ...form, week_start: e.target.value })}>
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </label>
          <label>Timezone <input value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></label>
          <button type="submit">Save</button>
        </form>
      </section>

      <section>
        <h2>Change password</h2>
        <form onSubmit={savePassword}>
          <label>Current <input type="password" value={pwd.current_password}
            onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} /></label>
          <label>New <input type="password" value={pwd.password}
            onChange={(e) => setPwd({ ...pwd, password: e.target.value })} /></label>
          <label>Confirm <input type="password" value={pwd.password_confirmation}
            onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} /></label>
          <button type="submit">Update password</button>
        </form>
      </section>
    </div>
  );
}