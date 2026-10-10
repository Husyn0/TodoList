import { useDraggable } from '@dnd-kit/core';
import {
  PRIORITY_LETTER,
  describeRepeat,
  describePeriod,
} from '../constants/task';

export default function TaskCard({
  task,
  occurrenceDate,
  occurrenceStatus,
  occurrenceMeetingTime,
  onEdit,
  onDelete,
  onToggleDone,
  preview,
}) {
  const isRepeated = task.repeat && task.repeat.preset !== 'none';
  const repeatLabel = describeRepeat(task.repeat);
  const periodLabel = describePeriod(task.period);

  // prefer the per-occurrence values, fall back to the task's own
  const status = occurrenceStatus ?? task.status ?? 'pending';
  const meetingTime = occurrenceMeetingTime ?? task.meeting_time ?? '';
  const isDone = status === 'done';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isRepeated || preview,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={preview ? undefined : setNodeRef}
      style={style}
      className={`task-card priority-${task.priority} status-${status} ${
        isDragging ? 'dragging' : ''
      } ${preview ? 'preview' : ''} ${isRepeated ? 'repeated' : ''}`}
      {...(preview ? {} : listeners)}
      {...(preview ? {} : attributes)}
    >
      <div className="task-head">
        <label
          className="task-check"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isDone}
            disabled={preview}
            onChange={(e) =>
              onToggleDone?.(task, occurrenceDate, e.target.checked)
            }
          />
          <span className="checkmark" />
        </label>

        <div className="task-title">{task.title}</div>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      {repeatLabel && (
        <div className="task-repeat">
          ↻ {repeatLabel}
          {occurrenceDate && isRepeated ? ' · occurrence' : ''}
        </div>
      )}

      {periodLabel && (
        <div className={`task-period period-${task.period}`}>{periodLabel}</div>
      )}

      <div className="task-footer">
        <span className={`priority-letter ${task.priority}`}>
          {PRIORITY_LETTER[task.priority] ?? '•'}
        </span>

        {meetingTime && (
          <span className="task-meeting-time">🕒 {meetingTime}</span>
        )}

        {!preview && (
          <div className="task-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task, occurrenceDate);
              }}
            >
              ✎
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(task.id, occurrenceDate);
              }}
            >
              🗑
            </button>
          </div>
        )}
      </div>
    </div>
  );
}