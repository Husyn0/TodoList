import { useEffect, useState, useCallback } from 'react';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import AddTaskModal from '../components/AddTaskModal';
import TasksHeader from '../components/tasks/TasksHeader';
import WeekBoard from '../components/tasks/WeekBoard';
import { tasksApi, tracksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  occursOnDate,
  isPastDate,
  trackKey,
  statusForOccurrence,
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

export default function Tasks() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), user?.week_start || 'monday')
  );
  const [tasks, setTasks] = useState([]);
  const [tracks, setTracks] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const [modal, setModal] = useState({ open: false, date: null, task: null });

  // Sync weekStart when user preference loads/changes
  useEffect(() => {
    if (user?.week_start) {
      setWeekStart(startOfWeek(new Date(), user.week_start));
    }
  }, [user?.week_start]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const load = useCallback(() => {
    tasksApi.getTasksForWeek(fmt(weekStart)).then(setTasks);
    tracksApi.getTracks().then(setTracks);
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

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
      await tasksApi.moveTask(taskId, targetDate, task.position ?? 0);
    } catch {
      load();
    }
  };

  const handleToggleDone = async (task, dateKey, checked) => {
    const nextStatus = checked ? 'done' : 'pending';
    try {
      await upsertTrackLocal(task.id, dateKey, { status: nextStatus });
    } catch {
      load();
    }
  };

  const handleSave = async (payload) => {
    if (isPastDate(payload.due_date)) {
      alert('You can’t schedule a task in the past.');
      return;
    }

    if (modal.task) {
      const data = await tasksApi.updateTask(modal.task.id, payload);
      setTasks((prev) => prev.map((t) => (t.id === modal.task.id ? data : t)));
    } else {
      const data = await tasksApi.createTask(payload);
      setTasks((prev) => [...prev, data]);
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
      <TasksHeader
        weekStart={weekStart}
        weekEnd={days[6]}
        doneToday={doneToday}
        onChangeWeek={changeWeek}
      />

      <WeekBoard
        days={days}
        sensors={sensors}
        activeTask={activeTask}
        tasksByDay={tasksByDay}
        tracks={tracks}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onAdd={(date) => setModal({ open: true, date, task: null })}
        onEdit={(task) => setModal({ open: true, date: null, task })}
        onDelete={handleDelete}
        onToggleDone={handleToggleDone}
      />

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