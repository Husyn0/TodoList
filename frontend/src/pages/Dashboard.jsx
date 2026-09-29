import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0 });

  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1);
    api.get('/tasks', { params: { week_start: start.toISOString().split('T')[0] } })
      .then((res) => {
        const tasks = res.data;
        setStats({
          total: tasks.length,
          done: tasks.filter((t) => t.status === 'done').length,
          pending: tasks.filter((t) => t.status !== 'done').length,
        });
      });
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.name} 👋</h1>
      <div className="stats-grid">
        <div className="stat-card"><h3>{stats.total}</h3><p>Total tasks this week</p></div>
        <div className="stat-card"><h3>{stats.done}</h3><p>Completed</p></div>
        <div className="stat-card"><h3>{stats.pending}</h3><p>Pending</p></div>
      </div>
    </div>
  );
}