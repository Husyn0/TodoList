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
import ContributionChart from '../components/ContributionChart';

const startOfWeek = (date, weekStart = 'monday') => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = weekStart === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmt = (d) => d.toISOString().split('T')[0];

// 9 weeks of history (matches ContributionChart)
const CONTRIB_WEEKS = 53;

export default function Dashboard() {
  const { user } = useAuth();
  const [weekTasks, setWeekTasks] = useState([]);
  const [rangeTasks, setRangeTasks] = useState([]);
  const [weekStart] = useState(() => startOfWeek(new Date()));

  // current week → radar chart
  useEffect(() => {
    api
      .get('/tasks', { params: { week_start: fmt(weekStart) } })
      .then((res) => setWeekTasks(res.data))
      .catch(() => setWeekTasks([]));
  }, [weekStart]);

  // ~2 months back → contribution chart
    useEffect(() => {
    let cancelled = false;

    const fetchRange = async () => {
      const promises = [];
      const today = new Date();
      // fetch one request per week_start, one per month for ~13 months
      const monthsBack = 13;
      for (let i = monthsBack - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(d.getMonth() - i);
        const ws = startOfWeek(d);
        promises.push(
          api
            .get('/tasks', { params: { week_start: fmt(ws) } })
            .then((r) => r.data)
            .catch(() => [])
        );
      }
      const results = await Promise.all(promises);
      if (cancelled) return;
      const byId = new Map();
      for (const list of results) for (const t of list) byId.set(t.id, t);
      setRangeTasks(Array.from(byId.values()));
    };

    fetchRange();
    return () => { cancelled = true; };
  }, []);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const chartData = useMemo(() => {
    return days.map((d) => {
      const key = fmt(d);
      const dayTasks = weekTasks.filter((t) => t.due_date?.split('T')[0] === key);
      const done = dayTasks.filter((t) => t.status === 'done').length;
      const pending = dayTasks.length - done;
      return {
        day: d.toLocaleDateString(undefined, { weekday: 'short' }),
        Pending: pending,
        Done: done,
        total: dayTasks.length,
      };
    });
  }, [days, weekTasks]);

  const total = weekTasks.length;
  const done = weekTasks.filter((t) => t.status === 'done').length;

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

      <ContributionChart tasks={rangeTasks} weeks={CONTRIB_WEEKS} />
    </div>
  );
}