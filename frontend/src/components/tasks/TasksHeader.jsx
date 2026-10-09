export default function TasksHeader({
  view,                 // 'week' | 'month'
  onViewChange,
  rangeLabel,           // string to show in the middle
  doneToday,
  onChangeRange,        // (offset) => void  — ±1 week or ±1 month depending on view
  onToday,
}) {
  return (
    <header className="tasks-header">
      <div className="tasks-header-left">
        <h1>Tasks</h1>
        <div className="view-toggle" role="tablist" aria-label="Time frame">
          <button
            role="tab"
            aria-selected={view === 'week'}
            className={view === 'week' ? 'active' : ''}
            onClick={() => onViewChange('week')}
          >
            Week
          </button>
          <button
            role="tab"
            aria-selected={view === 'month'}
            className={view === 'month' ? 'active' : ''}
            onClick={() => onViewChange('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="week-nav">
        <button onClick={() => onChangeRange(-1)}>←</button>
        <span>{rangeLabel}</span>
        <button onClick={() => onChangeRange(1)}>→</button>
        <button type="button" className="week-nav-today" onClick={onToday}>
          Today
        </button>
        <span className="done-today">✅ {doneToday} done today</span>
      </div>
    </header>
  );
}