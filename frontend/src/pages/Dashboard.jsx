import { useEffect, useMemo, useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../api';
import ContributionChart from '../components/ContributionChart';
import {
  activeWeekdays,
  WEEKDAY_ORDER,
  DAY_KEY_BY_INDEX,
} from '../constants/task';

const anchorWeekStart = (date, weekStart = 'monday') => {
  const target = WEEKDAY_ORDER.indexOf(weekStart);
  const d = new Date(date);
  const currentKey = DAY_KEY_BY_INDEX[d.getDay()];
  const current = WEEKDAY_ORDER.indexOf(currentKey);
  const diffToMonday = (current + 7) % 7;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + target);
  return d;
};

const fmt = (d) => d.toISOString().split('T')[0];
const CONTRIB_MONTHS = 12;

export default function Dashboard() {
  const { user } = useAuth();
  const weekStartKey = user?.week_start || 'monday';
  const weekEndKey   = user?.week_end   || 'sunday';

  const [weekTasks, setWeekTasks] = useState([]);
  const [rangeTasks, setRangeTasks] = useState([]);
  const [weekStart, setWeekStart] = useState(() =>
    anchorWeekStart(new Date(), weekStartKey)
  );

  useEffect(() => {
    setWeekStart(anchorWeekStart(new Date(), weekStartKey));
  }, [weekStartKey]);

  // Days to show = same active weekdays as Tasks page
  const activeKeys = activeWeekdays(weekStartKey, weekEndKey);
  const days = useMemo(
    () =>
      activeKeys.map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart, weekStartKey, weekEndKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!days.length) return;
    tasksApi.getTasksForWeek(fmt(days[0])).then(setWeekTasks).catch(() => setWeekTasks([]));
  }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - CONTRIB_MONTHS);
    let cancelled = false;
    tasksApi
      .getTasksRange(fmt(from), fmt(to))
      .then((t) => { if (!cancelled) setRangeTasks(t); })
      .catch(() => { if (!cancelled) setRangeTasks([]); });
    return () => { cancelled = true; };
  }, []);

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

      <div className="charts-row">
        <div className="radar-chart">
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={chartData} outerRadius="75%">
              <PolarGrid stroke="#e1e5f0" />
              <PolarAngleAxis dataKey="day" tick={{ fill: '#67708a', fontSize: 12 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 'dataMax + 1']}
                tick={{ fill: '#a0a8bd', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e1e5f0', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Radar name="Pending" dataKey="Pending" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} />
              <Radar name="Done"    dataKey="Done"    stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <ContributionChart tasks={rangeTasks} weeks={53} />
      </div>
    </div>
  );
}