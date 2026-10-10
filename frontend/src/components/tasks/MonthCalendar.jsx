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

const JS_TO_KEY = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

const buildMonthMatrix = (anchor, weekStartKey, weekEndKey) => {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end   = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);

  const startIdx = WEEKDAY_ORDER.indexOf(weekStartKey);
  const endIdx   = WEEKDAY_ORDER.indexOf(weekEndKey);
  const spanDays = endIdx >= startIdx
    ? endIdx - startIdx + 1
    : (7 - startIdx) + endIdx + 1;

  const gridStart = new Date(start);
  while (JS_TO_KEY[gridStart.getDay()] !== weekStartKey) {
    gridStart.setDate(gridStart.getDate() - 1);
  }

  const gridEnd = new Date(end);
  while (JS_TO_KEY[gridEnd.getDay()] !== weekEndKey) {
    gridEnd.setDate(gridEnd.getDate() + 1);
  }

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

  return {
    weeks,
    spanDays,
    inMonth: (date) => date.getMonth() === anchor.getMonth(),
  };
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

  // Weekday header row in the user's week order
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
    <div className="month-calendar" style={{ '--cols': spanDays }}>
      <div className="month-header" style={{ '--cols': spanDays }}>
        {headerKeys.map((k) => (
          <div key={k} className="month-header-cell">
            {WEEKDAY_LABELS[k]}
          </div>
        ))}
      </div>

      <div className="month-grid">
        {weeks.map((row, wi) => (
          <div key={wi} className="month-row">
            {row.map((date) => {
              const key = toKey(date);
              const isToday = key === today;
              const isPast  = key < today;
              const isOther = !inMonth(date);
              const list = tasksByDay(date);

              return (
                <div
                  key={key}
                  className={[
                    'month-cell',
                    isToday ? 'is-today' : '',
                    isPast ? 'is-past' : '',
                    isOther ? 'is-other-month' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <header className="month-cell-head">
                    <span className="month-cell-num">{date.getDate()}</span>
                  </header>

                  <div className="month-cell-body">
                    {list.map((t) => {
                      const status = statusForOccurrence(tracks, t, key);
                      const isRepeated = t.repeat && t.repeat.preset !== 'none';

                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={[
                            'month-chip',
                            `status-${status}`,
                            `priority-${t.priority}`,
                            isRepeated ? 'repeated' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          title={isRepeated ? `${t.title} (repeats)` : t.title}
                          onClick={() => onEdit(t, key)}
                        >
                          {isRepeated && (
                            <span className="month-chip-glyph" aria-hidden="true">↻</span>
                          )}
                          <span className="month-chip-title">{t.title}</span>
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