import { useDroppable } from '@dnd-kit/core';
import TaskCard from '../TaskCard';
import {
  isPastDate,
  statusForOccurrence,
  meetingTimeForOccurrence,
} from '../../constants/task';

const fmt = (d) => d.toISOString().split('T')[0];

export default function DayColumn({
  date,
  tasks,
  tracks,
  onAdd,
  onEdit,
  onDelete,
  onToggleDone,
}) {
  const key = fmt(date);
  const { setNodeRef, isOver } = useDroppable({ id: key });
  const isPast = isPastDate(key);

  return (
    <div ref={setNodeRef} className={`day-column ${isOver ? 'over' : ''}`}>
      <header>
        <span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
        <small>{date.getDate()}</small>
      </header>

      <div className="tasks-list">
        {tasks.map((t) => (
          <TaskCard
            key={`${t.id}-${key}`}
            task={t}
            occurrenceDate={key}
            occurrenceStatus={statusForOccurrence(tracks, t, key)}
            occurrenceMeetingTime={meetingTimeForOccurrence(tracks, t, key)}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleDone={onToggleDone}
          />
        ))}
      </div>

      <button
        className="add-task-btn"
        disabled={isPast}
        title={isPast ? 'Can’t add tasks to a past day' : 'Add task'}
        onClick={() => !isPast && onAdd(key)}
      >
        +
      </button>
    </div>
  );
}