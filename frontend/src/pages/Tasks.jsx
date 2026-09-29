import { useEffect, useState, useCallback } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable,
} from '@dnd-kit/core';
import api from '../api/client';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';

const startOfWeek = (date, weekStart = 'monday') => {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = weekStart === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmt = (d) => d.toISOString().split('T')[0];

function DayColumn({ date, tasks, onAdd, onEdit, onDelete }) {
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
          <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} />
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

  const tasksByDay = (dateKey) =>
    tasks.filter((t) => t.due_date?.split('T')[0] === dateKey)
         .sort((a, b) => a.position - b.position);

  const handleDragStart = (e) => {
    setActiveTask(tasks.find((t) => t.id === e.active.id));
  };

  const handleDragEnd = async (e) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    const targetDate = over.id; // droppable id = date string
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.due_date?.split('T')[0] === targetDate) return;

    // optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, due_date: targetDate } : t))
    );

    try {
      await api.patch(`/tasks/${taskId}/move`, { due_date: targetDate });
    } catch {
      load(); // rollback
    }
  };

  const handleSave = async (payload) => {
    if (modal.task) {
      await api.put(`/tasks/${modal.task.id}`, payload);
    } else {
      await api.post('/tasks', payload);
    }
    setModal({ open: false, date: null, task: null });
    load();
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
              tasks={tasksByDay(fmt(d))}
              onAdd={(date) => setModal({ open: true, date, task: null })}
              onEdit={(task) => setModal({ open: true, date: null, task })}
              onDelete={handleDelete}
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