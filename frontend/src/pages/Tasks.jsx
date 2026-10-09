import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import AddTaskModal from '../components/AddTaskModal';
import TasksHeader from '../components/tasks/TasksHeader';
import WeekBoard from '../components/tasks/WeekBoard';
import TimeFrameChart from '../components/tasks/TimeFrameChart';
import { tasksApi, tracksApi } from '../api';
import { useAuth } from '../context/AuthContext';
import {
  occursOnDate,
  isPastDate,
  trackKey,
  statusForOccurrence,
  todayKey,
  activeWeekdays,
  anchorWeekStart,
  toKey,
  fromKey,
  shiftWeek,
  startOfMonth,
  daysOfMonth,
  shiftMonth,
  monthLabel,
  dayLabel,
} from '../constants/task';

const MONTH_DAYS = (d) => daysOfMonth(d);

export default function Tasks() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const weekStartKey = user?.week_start || 'monday';
  const weekEndKey   = user?.week_end   || 'sunday';

  const view = params.get('view') === 'month' ? 'month' : 'week';

  const urlWeek  = params.get('week');
  const urlMonth = params.get('month');

  // Anchor depends on the active view
  const anchorDate = useMemo(() => {
    if (view === 'month') {
      if (urlMonth) {
        const d = fromKey(urlMonth);
        if (d) return startOfMonth(d);
      }
      return startOfMonth(new Date());
    }
    if (urlWeek) {
      const d = fromKey(urlWeek);
      if (d) return d;
    }
    return anchorWeekStart(new Date(), weekStartKey);
  }, [view, urlWeek, urlMonth, weekStartKey]);

  // Days to display (used by chart). In week view, also drives the board.
  const days = useMemo(() => {
    if (view === 'month') return MONTH_DAYS(anchorDate);
    const keys = activeWeekdays(weekStartKey, weekEndKey);
    return keys.map((_, i) => {
      const d = new Date(anchorDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [view, anchorDate, weekStartKey, weekEndKey]);

  const [tasks, setTasks] = useState([]);
  const [tracks, setTracks] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const [modal, setModal] = useState({ open: false, date: null, task: null });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Fetch tasks for the whole span so the chart has data for every bar.
  const load = useCallback(() => {
    if (!days.length) return;
    const from = toKey(days[0]);
    const to   = toKey(days[days.length - 1]);

    if (view === 'week') {
      tasksApi.getTasksForWeek(from).then(setTasks);
      tracksApi.getTracks(from, to).then(setTracks);
    } else {
      tasksApi.getTasksRange(from, to).then(setTasks);
      // tracks still scoped to the visible month, for board-less month view
      tracksApi.getTracks(from, to).then(setTracks);
    }
  }, [days, view]);

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

  // ---------- URL-driven navigation ----------
  const changeRange = (offset) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (view === 'month') {
        const next = shiftMonth(anchorDate, offset);
        p.set('month', toKey(startOfMonth(next)));
        p.delete('week');
      } else {
        const next = shiftWeek(toKey(anchorDate), offset);
        p.set('week', next);
        p.delete('month');
      }
      return p;
    });
  };

  const goToday = () => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete('week');
      p.delete('month');
      return p;
    });
  };

  const changeView = (next) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('view', next);
      // clear the other anchor so the new view starts at "now"
      if (next === 'month') p.delete('week');
      else p.delete('month');
      return p;
    });
  };

  const rangeLabel = useMemo(() => {
    if (view === 'month') return monthLabel(anchorDate);
    const first = days[0];
    const last  = days[days.length - 1];
    if (!first || !last) return '';
    return `${first.toLocaleDateString()} – ${last.toLocaleDateString()}`;
  }, [view, anchorDate, days]);

  const chartLabelFor = view === 'month' ? dayLabel : (d) =>
    d.toLocaleDateString(undefined, { weekday: 'short' });

  const today = todayKey();
  const doneToday = tasks
    .filter((t) => occursOnDate(t, new Date(today)))
    .filter((t) => statusForOccurrence(tracks, t, today) === 'done').length;

  return (
    <div className="tasks-page">
      <TasksHeader
        view={view}
        onViewChange={changeView}
        rangeLabel={rangeLabel}
        doneToday={doneToday}
        onChangeRange={changeRange}
        onToday={goToday}
      />

      <TimeFrameChart
        days={days}
        tasksByDay={tasksByDay}
        labelFor={chartLabelFor}
        title={view === 'month' ? 'Tasks per day — this month' : 'Tasks per day — this week'}
        subtitle={rangeLabel}
      />

      {view === 'week' && (
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
      )}

      {view === 'month' && (
        <MonthList
          days={days}
          tasksByDay={tasksByDay}
          tracks={tracks}
          onAdd={(date) => setModal({ open: true, date, task: null })}
          onEdit={(task) => setModal({ open: true, date: null, task })}
        />
      )}

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

/* ---------- Month-mode summary list ---------- */
function MonthList({ days, tasksByDay, tracks, onAdd, onEdit }) {
  const today = todayKey();
  return (
    <div className="month-list">
      {days.map((d) => {
        const key = toKey(d);
        const list = tasksByDay(d);
        const isToday = key === today;
        const isPast = key < today;
        return (
          <div key={key} className={`month-row ${isToday ? 'is-today' : ''} ${isPast ? 'is-past' : ''}`}>
            <div className="month-row-date">
              <span className="month-row-day">
                {d.toLocaleDateString(undefined, { weekday: 'short' })}
              </span>
              <span className="month-row-num">{d.getDate()}</span>
            </div>
            <div className="month-row-tasks">
              {list.length === 0 ? (
                <span className="month-row-empty">—</span>
              ) : (
                list.map((t) => {
                  const status = statusForOccurrence(tracks, t, key);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`month-chip status-${status} priority-${t.priority}`}
                      onClick={() => onEdit(t)}
                      title={t.title}
                    >
                      {t.title}
                    </button>
                  );
                })
              )}
            </div>
            <button
              type="button"
              className="month-row-add"
              disabled={isPast}
              onClick={() => !isPast && onAdd(key)}
              title={isPast ? 'Can’t add tasks to a past day' : 'Add task'}
            >
              +
            </button>
          </div>
        );
      })}
    </div>
  );
}