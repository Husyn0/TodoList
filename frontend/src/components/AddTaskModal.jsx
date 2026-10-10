import { useState } from 'react';
import {
  WEEKDAYS,
  REPEAT_PRESETS,
  PERIODS,
  DEFAULT_REPEAT,
  todayKey,
  isPastDate,
} from '../constants/task';

export default function AddTaskModal({ initialDate, task, onClose, onSave }) {
  const isEditing = !!task;
  const isRepeated = task?.repeat && task.repeat.preset !== 'none';

  // Initial due_date:
  //  - Edit-mode: the occurrence the user clicked (initialDate), falling back
  //    to the task's own due_date if none was supplied.
  //  - Add-mode:  the clicked day, else today.
  const initialDueDate =
    initialDate
    || task?.due_date?.split('T')[0]
    || todayKey();

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: initialDueDate,
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    position: task?.position ?? 0,
    meeting_time: (task?.meeting_time || '').slice(0, 5),
    period: task?.period || '',
    repeat: task?.repeat || DEFAULT_REPEAT,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleRepeatDay = (day) => {
    setForm((f) => {
      const has = f.repeat.days.includes(day);
      const days = has
        ? f.repeat.days.filter((d) => d !== day)
        : [...f.repeat.days, day];
      return { ...f, repeat: { ...f.repeat, days } };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Only block when creating a new task, or when an existing task's
    // due_date was changed to a past day. Editing a recurring task's
    // metadata (title, priority, period, etc.) with an unchanged anchor
    // is fine even if the anchor is in the past.
    const originalDue = task?.due_date?.split('T')[0];
    const dueChanged = form.due_date !== originalDue;
    const blocksForPast = !isEditing || dueChanged;

    if (blocksForPast && isPastDate(form.due_date)) {
      setError('You can’t schedule a task in the past.');
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      const errors = err?.response?.data?.errors;
      setError(errors ? Object.values(errors)[0][0] : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const showDayPicker = form.repeat.preset === 'custom';
  const dateMin = !isEditing ? todayKey() : undefined;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h2>{task ? 'Edit task' : 'New task'}</h2>
        {error && <p className="error">{error}</p>}

        <label>
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <div className="row">
          <label>
            Date
            <input
              type="date"
              required
              min={dateMin}
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </label>
          <label>
            Meeting time
            <input
              type="time"
              value={form.meeting_time}
              onChange={(e) =>
                setForm({ ...form, meeting_time: e.target.value })
              }
            />
          </label>
        </div>

        <div className="row">
          <label>
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>

        <label>
          Period of day
          <select
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Repeat
          <select
            value={form.repeat.preset}
            onChange={(e) =>
              setForm({
                ...form,
                repeat: { ...form.repeat, preset: e.target.value },
              })
            }
          >
            {REPEAT_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        {showDayPicker && (
          <div className="repeat-days">
            {WEEKDAYS.map((d) => {
              const active = form.repeat.days.includes(d.value);
              return (
                <button
                  type="button"
                  key={d.value}
                  className={`repeat-day ${active ? 'active' : ''}`}
                  onClick={() => toggleRepeatDay(d.value)}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}