import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import DayColumn from './DayColumn';
import TaskCard from '../TaskCard';

const fmt = (d) => d.toISOString().split('T')[0];

export default function WeekBoard({
  days,
  sensors,
  activeTask,
  tasksByDay,
  tracks,
  onDragStart,
  onDragEnd,
  onAdd,
  onEdit,
  onDelete,
  onToggleDone,
}) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="week-board">
        {days.map((d) => (
          <DayColumn
            key={fmt(d)}
            date={d}
            tasks={tasksByDay(d)}
            tracks={tracks}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleDone={onToggleDone}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} preview /> : null}
      </DragOverlay>
    </DndContext>
  );
}