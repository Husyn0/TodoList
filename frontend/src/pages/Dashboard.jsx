import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../api';
import ContributionChart from '../components/ContributionChart';
import {
  activeWeekdays,
  anchorWeekStart,
  toKey,
  fromKey,
  shiftWeek,
  PERIOD_ICON,
  PERIODS,
} from '../constants/task';

const CONTRIB_MONTHS = 12;

const PRIORITY_COLORS = {
  low:    '#60a5fa',
  medium: '#f59e0b',
  high:   '#ef4444',
};

const PERIOD_COLORS = {
  morning:   '#fbbf24',
  afternoon: '#f97316',
  evening:   '#8b5cf6',
  night:     '#1e293b',
};

/** Tasks that are past their due date and not done. */
const isOverdue = (t, todayKey) => {
  if (!t.due_date) return false;
  const key = t.due_date.split('T')[0];
  return key < todayKey && t.status !== 'done';
};

/** Streak helpers — count consecutive days with ≥1 completed task. */
const computeStreaks = (tasks, endKey) => {
  const doneByDay = new Map();
  for (const t of tasks) {
    if (t.status !== 'done') continue;
    const k = (t.due_date || '').split('T')[0];
    if (!k || k > endKey) continue;
    doneByDay.set(k, (doneByDay.get(k) || 0) + 1);
  }

  // current streak (walk back from endKey)
  let current = 0;
  const c = new Date(fromKey(endKey));
  while (true) {
    const k = toKey(c);
    if (doneByDay.get(k)) {
      current += 1;
      c.setDate(c.getDate() - 1);
    } else {
      // allow "today not done yet" to not break the streak
      if (current === 0 && k === endKey) {
        c.setDate(c.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // best streak (walk forward through all keys)
  const keys = Array.from(doneByDay.keys()).sort();
  let best = 0, run = 0, prev = null;
  for (const k of keys) {
    if (prev) {
      const d = new Date(fromKey(prev));
      d.setDate(d.getDate() + 1);
      if (toKey(d) === k) run += 1;
      else run = 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = k;
  }

  return { current, best };
};

export default function Dashboard() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const weekStartKey = user?.week_start || 'monday';
  const weekEndKey   = user?.week_end   || 'sunday';

  const urlWeek = params.get('week');

  // URL is the source of truth for the selected week.
  const weekStart = useMemo(() => {
    if (urlWeek) {
      const d = fromKey(urlWeek);
      if (d) return d;
    }
    return anchorWeekStart(new Date(), weekStartKey);
  }, [urlWeek, weekStartKey]);

  const days = useMemo(() => {
    const keys = activeWeekdays(weekStartKey, weekEndKey);
    return keys.map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart, weekStartKey, weekEndKey]);

  const [weekTasks, setWeekTasks] = useState([]);
  const [rangeTasks, setRangeTasks] = useState([]);

  // Fetch visible week's tasks.
  useEffect(() => {
    if (!days.length) return;
    tasksApi
      .getTasksForWeek(toKey(days[0]))
      .then(setWeekTasks)
      .catch(() => setWeekTasks([]));
  }, [days]);

  // Contribution chart window: last 12 months.
  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - CONTRIB_MONTHS);
    let cancelled = false;
    tasksApi
      .getTasksRange(toKey(from), toKey(to))
      .then((t) => { if (!cancelled) setRangeTasks(t); })
      .catch(() => { if (!cancelled) setRangeTasks([]); });
    return () => { cancelled = true; };
  }, []);

  // ---------- derived data ----------
  const todayKey = toKey(new Date());

  const weekStats = useMemo(() => {
    const total = weekTasks.length;
    const done = weekTasks.filter((t) => t.status === 'done').length;
    const pending = total - done;
    const overdue = weekTasks.filter((t) => isOverdue(t, todayKey)).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, overdue, pct };
  }, [weekTasks, todayKey]);

  const radarData = useMemo(() => {
    return days.map((d) => {
      const key = toKey(d);
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

  const priorityData = useMemo(() => {
    const map = { low: 0, medium: 0, high: 0 };
    for (const t of weekTasks) if (map[t.priority] != null) map[t.priority] += 1;
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [weekTasks]);

  const periodData = useMemo(() => {
    const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    for (const t of weekTasks) {
      if (t.period && counts[t.period] != null) counts[t.period] += 1;
    }
    return PERIODS.filter((p) => p.value).map((p) => ({
      name: p.label,
      value: counts[p.value] || 0,
      key: p.value,
    }));
  }, [weekTasks]);

  /** Last 8 weeks, completion count per week, ending with the selected week. */
  const trendData = useMemo(() => {
    const weeks = 8;
    const out = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const anchor = shiftWeek(toKey(weekStart), -i);
      const start = fromKey(anchor);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const startKey = toKey(start);
      const endKey = toKey(end);

      let done = 0, total = 0;
      for (const t of rangeTasks) {
        const k = (t.due_date || '').split('T')[0];
        if (!k || k < startKey || k > endKey) continue;
        total += 1;
        if (t.status === 'done') done += 1;
      }
      out.push({
        week: start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Done: done,
        Total: total,
      });
    }
    return out;
  }, [rangeTasks, weekStart]);

  const streaks = useMemo(
    () => computeStreaks(rangeTasks, todayKey),
    [rangeTasks, todayKey]
  );

  const upcoming = useMemo(() => {
    return weekTasks
      .filter((t) => t.status !== 'done')
      .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))
      .slice(0, 6);
  }, [weekTasks]);

  // ---------- week nav ----------
  const changeWeek = (offset) => {
    const next = shiftWeek(toKey(weekStart), offset);
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('week', next);
      return p;
    });
  };
  const goToday = () => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete('week');
      return p;
    });
  };

  const total = weekTasks.length;
  const done = weekStats.done;

  return (
    <div className="dashboard-page">
      <h1>Welcome, {user?.name} 👋</h1>

      <div className="dashboard-header">
        <p className="muted">
          Week of {days[0]?.toLocaleDateString()} – {days[days.length - 1]?.toLocaleDateString()} —{' '}
          {total} tasks ({done} done)
        </p>
        <div className="week-nav">
          <button onClick={() => changeWeek(-1)}>←</button>
          <button type="button" className="week-nav-today" onClick={goToday}>
            Today
          </button>
          <button onClick={() => changeWeek(1)}>→</button>
        </div>
      </div>

      {/* ---------- KPI cards ---------- */}
      <div className="kpi-row">
        <KpiCard label="Completed"  value={weekStats.done}      hint={`of ${weekStats.total}`} accent="green" />
        <KpiCard label="Pending"    value={weekStats.pending}   hint="this week"               accent="amber" />
        <KpiCard label="Overdue"    value={weekStats.overdue}   hint="past due"                accent="red"   />
        <KpiCard label="Completion" value={`${weekStats.pct}%`} hint="this week"               accent="violet" />
      </div>

      {/* ---------- Chart grid (named areas) ---------- */}
      <div className="dashboard-grid">
        {/* Row 1: radar + trend */}
        <div className="grid-radar">
          <div className="chart-card">
            <div className="chart-head">
              <h2>This week by day</h2>
              <p className="muted">Pending vs done per weekday</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e1e5f0" />
                <PolarAngleAxis dataKey="day" tick={{ fill: '#67708a', fontSize: 12 }} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 'dataMax + 1']}
                  tick={{ fill: '#a0a8bd', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Radar name="Pending" dataKey="Pending" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.35} />
                <Radar name="Done"    dataKey="Done"    stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid-trend">
          <div className="chart-card">
            <div className="chart-head">
              <h2>Trend</h2>
              <p className="muted">Completed vs total over the last 8 weeks</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e5f0" />
                <XAxis dataKey="week" tick={{ fill: '#67708a', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#a0a8bd', fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Total" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Done"  stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: donut + bars + streaks */}
        <div className="grid-donut">
          <div className="chart-card">
            <div className="chart-head">
              <h2>Priority mix</h2>
              <p className="muted">This week</p>
            </div>
            {priorityData.length === 0 ? (
              <EmptyState text="No tasks this week yet." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {priorityData.map((d) => (
                      <Cell key={d.name} fill={PRIORITY_COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid-bars">
          <div className="chart-card">
            <div className="chart-head">
              <h2>By time of day</h2>
              <p className="muted">This week</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={periodData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e5f0" />
                <XAxis dataKey="name" tick={{ fill: '#67708a', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#a0a8bd', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {periodData.map((d) => (
                    <Cell key={d.key} fill={PERIOD_COLORS[d.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid-streak">
          <div className="chart-card">
            <div className="chart-head">
              <h2>Streaks</h2>
              <p className="muted">Consecutive days with a completed task</p>
            </div>
            <div className="streak-grid">
              <div className="streak">
                <span className="streak-label">Current</span>
                <span className="streak-value">{streaks.current}</span>
                <span className="streak-unit">days</span>
              </div>
              <div className="streak">
                <span className="streak-label">Best</span>
                <span className="streak-value">{streaks.best}</span>
                <span className="streak-unit">days</span>
              </div>
            </div>
            <div className="streak-footer muted">
              {streaks.current === 0
                ? 'Complete a task today to start a streak.'
                : `Keep going — ${streaks.current === 1 ? '1 day' : `${streaks.current} days`} in a row.`}
            </div>
          </div>
        </div>

        {/* Row 3: contribution + upcoming */}
        <div className="grid-contrib">
          <ContributionChart tasks={rangeTasks} weeks={53} />
        </div>

        <div className="grid-upcoming">
          <div className="chart-card">
            <div className="chart-head">
              <h2>Upcoming</h2>
              <p className="muted">Next pending tasks this week</p>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState text="Nothing pending — nice work!" />
            ) : (
              <ul className="upcoming-list">
                {upcoming.map((t) => (
                  <li key={t.id} className={`upcoming-item priority-${t.priority}`}>
                    <span className="upcoming-date">
                      {t.due_date?.split('T')[0].slice(5)}
                    </span>
                    <span className="upcoming-title">{t.title}</span>
                    {t.period && (
                      <span className="upcoming-period">
                        {PERIOD_ICON[t.period]}
                      </span>
                    )}
                    <span className={`priority-letter ${t.priority}`}>
                      {t.priority[0].toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/tasks" className="chart-link">Go to board →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- small components ---------- */

function KpiCard({ label, value, hint, accent = 'violet' }) {
  return (
    <div className={`kpi-card accent-${accent}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {hint && <span className="kpi-hint">{hint}</span>}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}