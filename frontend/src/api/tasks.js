import api from './client';
import { normalizeTask, denormalizeTask } from '../constants/task';

export const getTasksForWeek = (weekStart) =>
  api
    .get('/tasks', { params: { week_start: weekStart } })
    .then((r) => r.data.map(normalizeTask));

export const getTasksRange = (from, to) =>
  api
    .get('/tasks/range', { params: { from, to } })
    .then((r) => r.data.map(normalizeTask));

export const createTask = (payload) =>
  api.post('/tasks', denormalizeTask(payload)).then((r) => normalizeTask(r.data));

export const updateTask = (id, payload) =>
  api
    .put(`/tasks/${id}`, denormalizeTask(payload))
    .then((r) => normalizeTask(r.data));

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);

export const moveTask = (id, dueDate, position = 0) =>
  api
    .patch(`/tasks/${id}/move`, { due_date: dueDate, position })
    .then((r) => normalizeTask(r.data));