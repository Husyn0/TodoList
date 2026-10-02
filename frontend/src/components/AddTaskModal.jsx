import { useState } from 'react';
import {
  WEEKDAYS,
  REPEAT_PRESETS,
  DEFAULT_REPEAT,
} from '../constants/task';

export default function AddTaskModal({ initialDate, task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date?.split('T')[0] || initialDate,
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    position: task?.position ?? 0,
    // ---- static-until-backend fields ----
    meeting_time: task?.meeting_time || '',
    repeat: task?.repeat || DEFAULT_REPEAT,
  });
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      // Backend doesn't support meeting_time / repeat yet.
      // Keep them on the task locally; strip from the API payload.
      const { meeting_time, repeat, ...apiPayload } = form;
      await onSave(apiPayload, { meeting_time, repeat });
    } finally {
      setSaving(false);
    }
  };

  const showDayPicker = form.repeat.preset === 'custom';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{task ? 'Edit task' : 'New task'}</h2>

        <label>Title
          <input required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>

        <label>Description
          <textarea value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>

        <div className="row">
          <label>Date
            <input type="date" required value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </label>
          <label>Meeting time
            <input type="time" value={form.meeting_time}
              onChange={(e) => setForm({ ...form, meeting_time: e.target.value })} />
          </label>
        </div>

        <div className="row">
          <label>Priority
            <select value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>Status
            <select value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>

        {/* ---- Repeat ---- */}
        <label>Repeat
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
              <option key={p.value} value={p.value}>{p.label}</option>
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
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}