import { useMemo } from 'react';

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const fmt = (d) => {
  const x = startOfDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const LEVELS = [
  { min: 0, cls: 'level-0' },
  { min: 1, cls: 'level-1' },
  { min: 3, cls: 'level-2' },
  { min: 5, cls: 'level-3' },
  { min: 8, cls: 'level-4' },
];

const levelFor = (n) => {
  let cls = 'level-0';
  for (const l of LEVELS) if (n >= l.min) cls = l.cls;
  return cls;
};

/**
 * Build a grid: columns = weeks, rows = days (Sun..Sat).
 * Shows the trailing `weeks` weeks ending today's week.
 */
const buildGrid = (weeks) => {
  const today = startOfDay(new Date());
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));       // end of current week (Sat)

  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const cols = [];
  let cursor = new Date(start);
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      col.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    cols.push(col);
  }
  return { cols, start, today };
};

export default function ContributionChart({ tasks = [], weeks = 53 }) {
  const { cols, start, today } = useMemo(() => buildGrid(weeks), [weeks]);

  const counts = useMemo(() => {
    const map = new Map();
    const startKey = fmt(start);
    const todayKey = fmt(today);

    for (const t of tasks) {
      if (t.status !== 'done') continue;
      const key = (t.due_date || '').split('T')[0];
      if (!key) continue;
      if (key < startKey || key > todayKey) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [tasks, start, today]);

  const total = useMemo(
    () => Array.from(counts.values()).reduce((a, b) => a + b, 0),
    [counts]
  );

  // Month label per column, only when the month changes from previous column
  const monthLabels = cols.map((col, i) => {
    const first = col[0];
    const prevFirst = i > 0 ? cols[i - 1][0] : null;
    if (!prevFirst || first.getMonth() !== prevFirst.getMonth()) {
      return first.toLocaleDateString(undefined, { month: 'short' });
    }
    return '';
  });

  return (
    <div className="contrib-card">
      <div className="contrib-head">
        <div>
          <h2>Activity</h2>
          <p className="muted">
            {total} {total === 1 ? 'task' : 'tasks'} completed in the last 12 months
          </p>
        </div>
        <div className="contrib-legend">
          <span>Less</span>
          {LEVELS.map((l) => (
            <span key={l.cls} className={`contrib-square ${l.cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="contrib-scroll">
        <div className="contrib-grid">
          <div className="contrib-day-labels">
            <span>Sun</span><span /><span>Tue</span><span /><span>Thu</span><span /><span>Sat</span>
          </div>

          <div className="contrib-weeks">
            <div className="contrib-months">
              {monthLabels.map((m, i) => (
                <span key={i} className="contrib-month-label">{m}</span>
              ))}
            </div>

            <div className="contrib-cols">
              {cols.map((col, i) => (
                <div key={i} className="contrib-col">
                  {col.map((date) => {
                    const key = fmt(date);
                    const inWindow = key <= fmt(today);
                    const n = counts.get(key) || 0;
                    const cls = inWindow ? levelFor(n) : 'level-empty';
                    return (
                      <span
                        key={key}
                        className={`contrib-square ${cls}`}
                        title={
                          inWindow
                            ? `${n} task${n === 1 ? '' : 's'} on ${key}`
                            : ''
                        }
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}