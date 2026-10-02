import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import { tasksApi, tracksApi } from '../api';
import {
  occursOnDate,
  isPastDate,
  trackKey,
  statusForOccurrence,
  meetingTimeForOccurrence,
  todayKey,
} from '../constants/task';

const startOfWeek = (date, weekStart = 'monday') => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = weekStart === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmt = (d) => d.toISOString().split('T')[0];

function DayColumn({ date, tasks, tracks, onAdd, onEdit, onDelete, onToggleDone }) {
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

export default function Tasks() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [tasks, setTasks] = useState([]);
  const [tracks, setTracks] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const [modal, setModal] = useState({ open: false, date: null, task: null });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const load = useCallback(() => {
    tasksApi.getTasksForWeek(fmt(weekStart)).then(setTasks);
    tracksApi.getTracks().then(setTracks);
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByDay = (date) =>
    tasks
      .filter((t) => occursOnDate(t, date))
      .sort((a, b) => a.position - b.position);

  const upsertTrackLocal = async (taskId, dateKey, patch) => {
    const updated = await tracksApi.upsertTrack(taskId, dateKey, patch);
    setTracks((prev) => ({ ...prev, [trackKey(taskId, dateKey)]: updated }));
  };

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
      await tasksApi.moveTask(taskId, targetDate);
    } catch {
      load();
    }
  };

  const handleToggleDone = async (task, dateKey, checked) => {
    const nextStatus = checked ? 'done' : 'pending';
    await upsertTrackLocal(task.id, dateKey, {
      status: nextStatus,
      completed_at: checked ? new Date().toISOString() : null,
    });
  };

  const handleSave = async (payload, extras = {}) => {
    if (isPastDate(payload.due_date)) {
      alert('You can’t schedule a task in the past.');
      return;
    }

    if (modal.task) {
      const data = await tasksApi.updateTask(modal.task.id, payload);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === modal.task.id ? { ...data, ...extras } : t
        )
      );
    } else {
      const data = await tasksApi.createTask(payload);
      setTasks((prev) => [...prev, { ...data, ...extras }]);
    }
    setModal({ open: false, date: null, task: null });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await tasksApi.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await tracksApi.deleteTracksForTask(id);
    setTracks((prev) => {
      const next = {};
      for (const [k, v] of Object.entries(prev)) {
        if (v.task_id !== id) next[k] = v;
      }
      return next;
    });
  };

  const changeWeek = (offset) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset * 7);
    setWeekStart(d);
  };

  const today = todayKey();
  const doneToday = tasks
    .filter((t) => occursOnDate(t, new Date(today)))
    .filter((t) => statusForOccurrence(tracks, t, today) === 'done').length;

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <h1>Weekly Tasks</h1>
        <div className="week-nav">
          <button onClick={() => changeWeek(-1)}>←</button>
          <span>
            {weekStart.toLocaleDateString()} – {days[6].toLocaleDateString()}
          </span>
          <button onClick={() => changeWeek(1)}>→</button>
          <span className="done-today">✅ {doneToday} done today</span>
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
              tracks={tracks}
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