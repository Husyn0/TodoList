import { useDraggable } from '@dnd-kit/core';

export default function TaskCard({ task, onEdit, onDelete, preview }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
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
      } ${preview ? 'preview' : ''}`}
      {...(preview ? {} : listeners)}
      {...(preview ? {} : attributes)}
    >
      <div className="task-title">{task.title}</div>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-footer">
        <span className={`badge ${task.priority}`}>{task.priority}</span>
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