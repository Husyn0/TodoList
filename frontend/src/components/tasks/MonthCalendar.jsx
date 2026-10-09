import {
  toKey,
  statusForOccurrence,
  todayKey,
  WEEKDAY_ORDER,
} from '../../constants/task';

const WEEKDAY_LABELS = {
  monday:    'Mon',
  tuesday:   'Tue',
  wednesday: 'Wed',
  thursday:  'Thu',
  friday:    'Fri',
  saturday:  'Sat',
  sunday:    'Sun',
};

/**
 * Builds a calendar matrix for the month that contains `anchor`.
 * Each row is a full week; the first and last weeks are padded with
 * `null` so the grid always starts on `weekStart` and ends on `weekEnd`.
 */
const buildMonthMatrix = (anchor, weekStartKey, weekEndKey) => {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end   = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);

  // JS Date.getDay(): 0=Sun..6=Sat
  const JS_TO_KEY = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

  const startIdx = WEEKDAY_ORDER.indexOf(weekStartKey);
  const endIdx   = WEEKDAY_ORDER.indexOf(weekEndKey);
  const spanDays = endIdx >= startIdx
    ? endIdx - startIdx + 1
    : (7 - startIdx) + endIdx + 1;   // wraps past Sunday (e.g. sun → sat)

  // Walk back from the 1st until we land on weekStart.
  const gridStart = new Date(start);
  while (JS_TO_KEY[gridStart.getDay()] !== weekStartKey) {
    gridStart.setDate(gridStart.getDate() - 1);
  }

  // Walk forward from the last day until we land on weekEnd.
  const gridEnd = new Date(end);
  while (JS_TO_KEY[gridEnd.getDay()] !== weekEndKey) {
    gridEnd.setDate(gridEnd.getDate() + 1);
  }

  // Fill the grid.
  const weeks = [];
  let cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const row = [];
    for (let d = 0; d < spanDays; d++) {
      row.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
  }

  return { weeks, spanDays, inMonth: (date) => date.getMonth() === anchor.getMonth() };
};

export default function MonthCalendar({
  anchor,
  weekStartKey,
  weekEndKey,
  tasksByDay,
  tracks,
  onAdd,
  onEdit,
}) {
  const { weeks, spanDays, inMonth } = buildMonthMatrix(anchor, weekStartKey, weekEndKey);
  const today = todayKey();

  // Header row: labels in the user's week order
  const headerKeys = [];
  {
    let i = WEEKDAY_ORDER.indexOf(weekStartKey);
    const endI = WEEKDAY_ORDER.indexOf(weekEndKey);
    while (true) {
      headerKeys.push(WEEKDAY_ORDER[i]);
      if (i === endI) break;
      i = (i + 1) % 7;
    }
  }

  return (
    <div
      className="month-calendar"
      style={{ '--cols': spanDays }}
    >
      {/* Weekday header */}
      <div className="month-header" style={{ '--cols': spanDays }}>
        {headerKeys.map((k) => (
          <div key={k} className="month-header-cell">
            {WEEKDAY_LABELS[k]}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="month-grid">
        {weeks.map((row, wi) => (
          <div key={wi} className="month-row">
            {row.map((date) => {
              const key = toKey(date);
              const isToday  = key === today;
              const isPast   = key < today;
              const isOther  = !inMonth(date);
              const list = tasksByDay(date);

              return (
                <div
                  key={key}
                  className={[
                    'month-cell',
                    isToday ? 'is-today' : '',
                    isPast ? 'is-past' : '',
                    isOther ? 'is-other-month' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <header className="month-cell-head">
                    <span className="month-cell-num">{date.getDate()}</span>
                  </header>

                  <div className="month-cell-body">
                    {list.map((t) => {
                      const status = statusForOccurrence(tracks, t, key);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`month-chip status-${status} priority-${t.priority}`}
                          title={t.title}
                          onClick={() => onEdit(t)}
                        >
                          {t.title}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="month-cell-add"
                    disabled={isPast}
                    title={isPast ? 'Can’t add tasks to a past day' : 'Add task'}
                    onClick={() => !isPast && onAdd(key)}
                  >
                    +
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}