import api from './client';

/**
 * Get tracks for a date range.
 * Backend requires ?from=YYYY-MM-DD&to=YYYY-MM-DD.
 */
export const getTracks = (from, to) =>
  api.get('/tracks', { params: { from, to } }).then((r) => {
    const map = {};
    for (const tr of r.data) {
      const dateKey = tr.date ? String(tr.date).split('T')[0] : tr.date;
      map[`${tr.task_id}__${dateKey}`] = {
        ...tr,
        date: dateKey,
        meeting_time: (tr.meeting_time || '').slice(0, 5),
      };
    }
    return map;
  });

export const upsertTrack = (taskId, dateKey, patch) =>
  api.put(`/tracks/${taskId}/${dateKey}`, patch).then((r) => ({
    ...r.data,
    date: r.data.date ? String(r.data.date).split('T')[0] : dateKey,
    meeting_time: (r.data.meeting_time || '').slice(0, 5),
  }));

export const deleteTracksForTask = (taskId) =>
  api.delete(`/tracks/task/${taskId}`).then((r) => r.data);

export const deleteTrack = (taskId, dateKey) =>
  api.delete(`/tracks/${taskId}/${dateKey}`).then((r) => r.data);