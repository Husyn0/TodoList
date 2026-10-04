// src/constants/task.js

export const PRIORITY_LETTER = { low: 'L', medium: 'M', high: 'H' };

export const WEEKDAYS = [
  { value: 'monday',    label: 'Mon' },
  { value: 'tuesday',   label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday',  label: 'Thu' },
  { value: 'friday',    label: 'Fri' },
  { value: 'saturday',  label: 'Sat' },
  { value: 'sunday',    label: 'Sun' },
];

export const REPEAT_PRESETS = [
  { value: 'none',   label: 'Does not repeat' },
  { value: 'daily',  label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'custom', label: 'Custom days…' },
];

export const DEFAULT_REPEAT = { preset: 'none', days: [] };

// JS Date.getDay(): 0=Sun … 6=Sat → full names (backend format)
export const DAY_KEY_BY_INDEX = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

// ---------- backend <-> frontend mapping ----------
export const normalizeTask = (t) => ({
  ...t,
  due_date: t.due_date ? String(t.due_date).split('T')[0] : t.due_date,
  meeting_time: (t.meeting_time || '').slice(0, 5),
  repeat: {
    preset: t.repeat_preset ?? 'none',
    days: t.repeat_days ?? [],
  },
});

export const denormalizeTask = (form) => {
  const { repeat, meeting_time, ...rest } = form;
  const mt = meeting_time
    ? (meeting_time.length === 5 ? `${meeting_time}:00` : meeting_time)
    : null;
  return {
    ...rest,
    meeting_time: mt,
    repeat_preset: repeat?.preset ?? 'none',
    repeat_days: repeat?.preset === 'custom' ? repeat.days : null,
  };
};

// ---------- UI helpers ----------
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
  const dueKey = task.due_date ? String(task.due_date).split('T')[0] : null;
  const repeat = task.repeat;

  if (!repeat || repeat.preset === 'none') return key === dueKey;
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

// ---------- date helpers ----------
export const todayKey = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

export const isPastDate = (key) => {
  if (!key) return false;
  return key < todayKey();
};

// ---------- track helpers ----------
export const trackKey = (taskId, dateKey) => `${taskId}__${dateKey}`;

// Fallback status when no track exists yet.
export const statusForOccurrence = (tracks, task, dateKey) => {
  const k = trackKey(task.id, dateKey);
  if (tracks[k]) return tracks[k].status;
  const isRepeated = task.repeat && task.repeat.preset !== 'none';
  return isRepeated ? 'pending' : (task.status || 'pending');
};

export const meetingTimeForOccurrence = (tracks, task, dateKey) => {
  const k = trackKey(task.id, dateKey);
  const mt = tracks[k]?.meeting_time ?? task.meeting_time ?? '';
  return (mt || '').slice(0, 5);
};