import api from './client';

/**
 * Fetch tasks for a given week (week_start = YYYY-MM-DD, Monday).
 */
export const getTasksForWeek = (weekStart) =>
  api.get('/tasks', { params: { week_start: weekStart } }).then((r) => r.data);

export const createTask = (payload) =>
  api.post('/tasks', payload).then((r) => r.data);

export const updateTask = (id, payload) =>
  api.put(`/tasks/${id}`, payload).then((r) => r.data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);

export const moveTask = (id, dueDate) =>
  api.patch(`/tasks/${id}/move`, { due_date: dueDate }).then((r) => r.data);

/**
 * Fetch ~1 year of tasks in batched weekly requests.
 * Deduplicated by task id.
 */
export const getTasksRange = async (monthsBack = 13) => {
  const today = new Date();
  const requests = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);

    // Monday of that week
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const ws = new Date(d);
    ws.setDate(ws.getDate() + diff);
    ws.setHours(0, 0, 0, 0);

    const key = ws.toISOString().split('T')[0];
    requests.push(getTasksForWeek(key).catch(() => []));
  }

  const results = await Promise.all(requests);
  const byId = new Map();
  for (const list of results) for (const t of list) byId.set(t.id, t);
  return Array.from(byId.values());
};