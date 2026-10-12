import api from './client';
import { normalizeTask, denormalizeTask } from '../constants/task';

/**
 * Guarantee the wire format for `due_date` is a plain local "YYYY-MM-DD".
 * Never toISOString() — that shifts by timezone.
 */
const normalizeDueDate = (v) => {
  if (!v) return v;
  if (typeof v === 'string') return v.split('T')[0];
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return v;
};

const prep = (payload) => {
  const p = denormalizeTask(payload);
  return { ...p, due_date: normalizeDueDate(p.due_date) };
};

export const getTasksForWeek = (weekStart) =>
  api
    .get('/tasks', { params: { week_start: weekStart } })
    .then((r) => r.data.map(normalizeTask));

export const getTasksRange = (from, to) =>
  api
    .get('/tasks/range', { params: { from, to } })
    .then((r) => r.data.map(normalizeTask));

export const createTask = (payload) =>
  api.post('/tasks', prep(payload)).then((r) => normalizeTask(r.data));

export const updateTask = (id, payload) =>
  api.put(`/tasks/${id}`, prep(payload)).then((r) => normalizeTask(r.data));

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);

export const moveTask = (id, dueDate, position = 0) =>
  api
    .patch(`/tasks/${id}/move`, {
      due_date: normalizeDueDate(dueDate),
      position,
    })
    .then((r) => normalizeTask(r.data));