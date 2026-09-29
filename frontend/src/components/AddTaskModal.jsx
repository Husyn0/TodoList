import { useState } from 'react';

export default function AddTaskModal({ initialDate, task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date?.split('T')[0] || initialDate,
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    position: task?.position ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

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
        <label>Date
          <input type="date" required value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        </label>
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
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}