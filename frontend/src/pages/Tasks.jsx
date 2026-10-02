import { useEffect, useState, useCallback } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable,
} from '@dnd-kit/core';
import api from '../api/client';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import { occursOnDate } from '../constants/task';

const startOfWeek = (date, weekStart = 'monday') => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = weekStart === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmt = (d) => d.toISOString().split('T')[0];

function DayColumn({ date, tasks, onAdd, onEdit, onDelete, onToggleDone }) {
  const key = fmt(date);
  const { setNodeRef, isOver } = useDroppable({ id: key });

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
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleDone={onToggleDone}
          />
        ))}
      </div>
      <button className="add-task-btn" onClick={() => onAdd(key)}>+</button>
    </div>
  );
}

export default function Tasks() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [modal, setModal] = useState({ open: false, date: null, task: null });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const load = useCallback(() => {
    api.get('/tasks', { params: { week_start: fmt(weekStart) } })
      .then((res) => setTasks(res.data));
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByDay = (date) =>
    tasks
      .filter((t) => occursOnDate(t, date))
      .sort((a, b) => a.position - b.position);

  const handleDragStart = (e) => {
    setActiveTask(tasks.find((t) => t.id === e.active.id));
  };

  const handleDragEnd = async (e) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    const targetDate = over.id;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.repeat && task.repeat.preset !== 'none') return;
    if (task.due_date?.split('T')[0] === targetDate) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, due_date: targetDate } : t))
    );

    try {
      await api.patch(`/tasks/${taskId}/move`, { due_date: targetDate });
    } catch {
      load();
    }
  };

  // ---- NEW: toggle done/pending ----
  const handleToggleDone = async (task, checked) => {
    const nextStatus = checked ? 'done' : 'pending';

    // optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
    } catch {
      load(); // rollback
    }
  };

  const handleSave = async (payload, extras = {}) => {
    if (modal.task) {
      const { data } = await api.put(`/tasks/${modal.task.id}`, payload);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === modal.task.id ? { ...data, ...extras } : t
        )
      );
    } else {
      const { data } = await api.post('/tasks', payload);
      setTasks((prev) => [...prev, { ...data, ...extras }]);
    }
    setModal({ open: false, date: null, task: null });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const changeWeek = (offset) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset * 7);
    setWeekStart(d);
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <h1>Weekly Tasks</h1>
        <div className="week-nav">
          <button onClick={() => changeWeek(-1)}>←</button>
          <span>{weekStart.toLocaleDateString()} – {days[6].toLocaleDateString()}</span>
          <button onClick={() => changeWeek(1)}>→</button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="week-board">
          {days.map((d) => (
            <DayColumn
              key={fmt(d)}
              date={d}
              tasks={tasksByDay(d)}
              onAdd={(date) => setModal({ open: true, date, task: null })}
              onEdit={(task) => setModal({ open: true, date: null, task })}
              onDelete={handleDelete}
              onToggleDone={handleToggleDone}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} preview /> : null}
        </DragOverlay>
      </DndContext>

      {modal.open && (
        <AddTaskModal
          initialDate={modal.date || modal.task?.due_date?.split('T')[0]}
          task={modal.task}
          onClose={() => setModal({ open: false, date: null, task: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
}