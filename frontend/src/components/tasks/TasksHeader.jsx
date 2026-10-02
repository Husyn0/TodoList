export default function TasksHeader({
  weekStart,
  weekEnd,
  doneToday,
  onChangeWeek,
}) {
  return (
    <header className="tasks-header">
      <h1>Weekly Tasks</h1>
      <div className="week-nav">
        <button onClick={() => onChangeWeek(-1)}>←</button>
        <span>
          {weekStart.toLocaleDateString()} – {weekEnd.toLocaleDateString()}
        </span>
        <button onClick={() => onChangeWeek(1)}>→</button>
        <span className="done-today">✅ {doneToday} done today</span>
      </div>
    </header>
  );
}