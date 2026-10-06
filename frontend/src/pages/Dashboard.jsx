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
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../api';
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

const CONTRIB_MONTHS = 12;

export default function Dashboard() {
  const { user } = useAuth();
  const [weekTasks, setWeekTasks] = useState([]);
  const [rangeTasks, setRangeTasks] = useState([]);
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), user?.week_start || 'monday')
  );

  // Sync weekStart when user preference loads/changes
  useEffect(() => {
    if (user?.week_start) {
      setWeekStart(startOfWeek(new Date(), user.week_start));
    }
  }, [user?.week_start]);

  // current week → radar
  useEffect(() => {
    tasksApi
      .getTasksForWeek(fmt(weekStart))
      .then(setWeekTasks)
      .catch(() => setWeekTasks([]));
  }, [weekStart]);

  // ~1 year back → contribution chart
  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - CONTRIB_MONTHS);

    let cancelled = false;
    tasksApi
      .getTasksRange(fmt(from), fmt(to))
      .then((tasks) => {
        if (!cancelled) setRangeTasks(tasks);
      })
      .catch(() => {
        if (!cancelled) setRangeTasks([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart]
  );

  const chartData = useMemo(() => {
    return days.map((d) => {
      const key = fmt(d);
      const dayTasks = weekTasks.filter(
        (t) => t.due_date?.split('T')[0] === key
      );
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

      <div className="charts-row">
        <div className="radar-chart">
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={chartData} outerRadius="75%">
              <PolarGrid stroke="#e1e5f0" />
              <PolarAngleAxis
                dataKey="day"
                tick={{ fill: '#67708a', fontSize: 12 }}
              />
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
              <Legend wrapperStyle={{ fontSize: 12 }} />
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

        <ContributionChart tasks={rangeTasks} weeks={53} />
      </div>
    </div>
  );
}