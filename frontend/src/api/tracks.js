/**
 * Occurrence tracks (per-day status / meeting time for repeating tasks).
 * Currently local-only; swap in real API calls when backend is ready.
 */

// In-memory fallback store. Replace with API calls later.
let localTracks = {};

export const trackKey = (taskId, dateKey) => `${taskId}__${dateKey}`;

// ---- real API (uncomment when backend exists) ----
// export const getTracks = (from, to) =>
//   api.get('/tracks', { params: { from, to } }).then((r) => r.data);

// export const upsertTrack = (taskId, dateKey, patch) =>
//   api.put(`/tracks/${taskId}/${dateKey}`, patch).then((r) => r.data);

// export const deleteTracksForTask = (taskId) =>
//   api.delete(`/tracks/task/${taskId}`).then((r) => r.data);

// ---- local fallback (current) ----
export const getTracks = async () => ({ ...localTracks });

export const upsertTrack = async (taskId, dateKey, patch) => {
  const k = trackKey(taskId, dateKey);
  const current = localTracks[k] || { task_id: taskId, date: dateKey, status: 'pending' };
  localTracks[k] = { ...current, ...patch };
  return localTracks[k];
};

export const deleteTracksForTask = async (taskId) => {
  const next = {};
  for (const [k, v] of Object.entries(localTracks)) {
    if (v.task_id !== taskId) next[k] = v;
  }
  localTracks = next;
};