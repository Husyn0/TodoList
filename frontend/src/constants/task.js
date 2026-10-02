// src/constants/task.js

export const PRIORITY_LETTER = { low: 'L', medium: 'M', high: 'H' };

export const WEEKDAYS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export const REPEAT_PRESETS = [
  { value: 'none',   label: 'Does not repeat' },
  { value: 'daily',  label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'custom', label: 'Custom days…' },
];

export const DEFAULT_REPEAT = { preset: 'none', days: [] };

// JS Date.getDay(): 0=Sun … 6=Sat  →  our short keys
export const DAY_KEY_BY_INDEX = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const describeRepeat = (repeat) => {
  if (!repeat || repeat.preset === 'none') return null;
  if (repeat.preset === 'daily')  return 'Every day';
  if (repeat.preset === 'weekly') return 'Weekly';
  if (repeat.preset === 'custom' && repeat.days?.length) {
    const labels = WEEKDAYS
      .filter((d) => repeat.days.includes(d.value))
      .map((d) => d.label);
    if (labels.length === 7) return 'Every day';
    return labels.join(' · ');
  }
  return null;
};

/**
 * Does this task occur on the given Date?
 *  - No repeat  → only on its own due_date.
 *  - daily      → every day from due_date onward (within the visible week).
 *  - weekly     → same weekday as due_date.
 *  - custom     → any day in repeat.days, from due_date onward.
 */
export const occursOnDate = (task, date) => {
  const key = date.toISOString().split('T')[0];
  const dueKey = task.due_date?.split('T')[0];
  const repeat = task.repeat;

  // No repeat → only on due date
  if (!repeat || repeat.preset === 'none') return key === dueKey;

  // Never show before it starts
  if (dueKey && key < dueKey) return false;

  const dayKey = DAY_KEY_BY_INDEX[date.getDay()];

  if (repeat.preset === 'daily')  return true;
  if (repeat.preset === 'weekly') {
    const dueDay = dueKey ? DAY_KEY_BY_INDEX[new Date(dueKey).getDay()] : null;
    return dayKey === dueDay;
  }
  if (repeat.preset === 'custom') return repeat.days?.includes(dayKey) ?? false;

  return key === dueKey;
};

// ---- date helpers ----
export const todayKey = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

export const isPastDate = (key) => {
  if (!key) return false;
  return key < todayKey();
};
// ---- track helpers (static until backend exists) ----

export const trackKey = (taskId, dateKey) => `${taskId}__${dateKey}`;

// Deterministic fallback status when no track exists yet.
// Non-repeated tasks fall back to their task.status;
// repeated tasks default to 'pending' per day.
export const statusForOccurrence = (tracks, task, dateKey) => {
  const k = trackKey(task.id, dateKey);
  if (tracks[k]) return tracks[k].status;
  const isRepeated = task.repeat && task.repeat.preset !== 'none';
  return isRepeated ? 'pending' : (task.status || 'pending');
};

export const meetingTimeForOccurrence = (tracks, task, dateKey) => {
  const k = trackKey(task.id, dateKey);
  return tracks[k]?.meeting_time ?? task.meeting_time ?? '';
};