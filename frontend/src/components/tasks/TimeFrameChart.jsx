import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { toKey } from '../../constants/task';

const STATUS_COLORS = {
  done:        '#10b981',
  in_progress: '#f59e0b',
  pending:     '#94a3b8',
};

/**
 * Props:
 *  - days: Date[]           // one entry per bar
 *  - tasksByDay: (date) => Task[]
 *  - labelFor: (date) => string
 *  - title, subtitle
 */
export default function TimeFrameChart({ days, tasksByDay, labelFor, title, subtitle }) {
  const data = days.map((d) => {
    const key = toKey(d);
    const list = tasksByDay(d) || [];
    const done = list.filter((t) => t.status === 'done').length;
    const inProgress = list.filter((t) => t.status === 'in_progress').length;
    const pending = list.filter((t) => t.status === 'pending').length;
    return {
      key,
      label: labelFor(d),
      Done: done,
      'In Progress': inProgress,
      Pending: pending,
      Total: list.length,
    };
  });

  const totalTasks = data.reduce((a, d) => a + d.Total, 0);
  const totalDone  = data.reduce((a, d) => a + d.Done, 0);
  const pct = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  // Compact X axis when there are many bars
  const dense = data.length > 14;

  return (
    <div className="chart-card timeframe-chart">
      <div className="chart-head">
        <div>
          <h2>{title}</h2>
          <p className="muted">
            {subtitle} · {totalTasks} tasks · {totalDone} done ({pct}%)
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
          barCategoryGap={dense ? 2 : 6}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#67708a', fontSize: dense ? 10 : 12 }}
            interval={dense ? Math.ceil(data.length / 15) - 1 : 0}
          />
          <YAxis allowDecimals={false} tick={{ fill: '#a0a8bd', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e1e5f0', fontSize: 13 }}
            labelFormatter={(label, payload) => {
              const row = payload?.[0]?.payload;
              return row?.key || label;
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Done"        stackId="a" fill={STATUS_COLORS.done}        radius={[0, 0, 0, 0]} />
          <Bar dataKey="In Progress" stackId="a" fill={STATUS_COLORS.in_progress} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Pending"     stackId="a" fill={STATUS_COLORS.pending}     radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}