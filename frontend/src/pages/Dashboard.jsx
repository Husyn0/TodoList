import { useEffect, useMemo, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

// ---------- date helpers ----------
const startOfWeek = (date, weekStart = 'monday') => {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = weekStart === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmt = (d) => d.toISOString().split('T')[0];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [weekStart] = useState(() => startOfWeek(new Date()));

  useEffect(() => {
    api
      .get('/tasks', { params: { week_start: fmt(weekStart) } })
      .then((res) => setTasks(res.data))
      .catch(() => setTasks([]));
  }, [weekStart]);

  // Build the 7 days of the current week
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // Build radar data: one row per day, with pending/done counts
  const chartData = useMemo(() => {
    return days.map((d) => {
      const key = fmt(d);
      const dayTasks = tasks.filter((t) => t.due_date?.split('T')[0] === key);
      const done = dayTasks.filter((t) => t.status === 'done').length;
      const pending = dayTasks.length - done;
      return {
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        Pending: pending,
        Done: done,
        total: dayTasks.length,
      };
    });
  }, [days, tasks]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.name} 👋</h1>

      <div className="dashboard-header">
        <p className="muted">
          Week of {weekStart.toLocaleDateString()} — {total} tasks ({done} done)
        </p>
      </div>

      <div className="radar-card">
        <ResponsiveContainer width="100%" height={420}>
          <RadarChart data={chartData} outerRadius="75%">
            <PolarGrid stroke="#e1e5f0" />
            <PolarAngleAxis dataKey="day" tick={{ fill: '#67708a', fontSize: 13 }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'dataMax + 1']}
              tick={{ fill: '#a0a8bd', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e1e5f0',
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Radar
              name="Pending"
              dataKey="Pending"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.35}
            />
            <Radar
              name="Done"
              dataKey="Done"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}