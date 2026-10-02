import { useDraggable } from '@dnd-kit/core';
import { PRIORITY_LETTER, describeRepeat } from '../constants/task';

export default function TaskCard({ task, occurrenceDate, onEdit, onDelete, preview }) {
  const isRepeated = task.repeat && task.repeat.preset !== 'none';
  const repeatLabel = describeRepeat(task.repeat);

  // Only non-repeated tasks are draggable (until backend supports per-occurrence move)
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
      className={`task-card priority-${task.priority} status-${task.status} ${
        isDragging ? 'dragging' : ''
      } ${preview ? 'preview' : ''} ${isRepeated ? 'repeated' : ''}`}
      {...(preview ? {} : listeners)}
      {...(preview ? {} : attributes)}
    >
      <div className="task-title">{task.title}</div>
      {task.description && <p className="task-desc">{task.description}</p>}

      {repeatLabel && (
        <div className="task-repeat">
          ↻ {repeatLabel}
          {occurrenceDate && isRepeated ? ' · occurrence' : ''}
        </div>
      )}

      <div className="task-footer">
        <span className={`priority-letter ${task.priority}`}>
          {PRIORITY_LETTER[task.priority] ?? '•'}
        </span>

        {task.meeting_time && (
          <span className="task-meeting-time">🕒 {task.meeting_time}</span>
        )}

        {!preview && (
          <div className="task-actions">
            <button onClick={(e) => { e.stopPropagation(); onEdit?.(task); }}>✎</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}>🗑</button>
          </div>
        )}
      </div>
    </div>
  );
}