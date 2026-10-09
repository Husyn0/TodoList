// src/constants/task.js

export const PRIORITY_LETTER = { low: 'L', medium: 'M', high: 'H' };

export const PERIODS = [
  { value: '',          label: 'Any time' },
  { value: 'morning',   label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening',   label: 'Evening' },
  { value: 'night',     label: 'Night' },
];

export const PERIOD_ICON = {
  morning:   '🌅',
  afternoon: '☀️',
  evening:   '🌆',
  night:     '🌙',
};

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
// Ordered list of weekday keys Mon→Sun (matching WEEKDAYS order)
export const WEEKDAY_ORDER = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

// JS Date.getDay(): 0=Sun…6=Sat → index into WEEKDAY_ORDER
export const JS_DAY_TO_ORDER = {
  1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6,
};

/**
 * Return the list of weekday keys between `weekStart` and `weekEnd`
 * inclusive, following the WEEKDAY_ORDER (Monday-first) sequence.
 *
 * Example:
 *   weekStart='monday', weekEnd='friday' → ['monday','tuesday','wednesday','thursday','friday']
 *   weekStart='sunday', weekEnd='sunday' → ['sunday']
 *   weekStart='monday', weekEnd='sunday' → all 7 days
 */
export const activeWeekdays = (weekStart = 'monday', weekEnd = 'sunday') => {
  const startIdx = WEEKDAY_ORDER.indexOf(weekStart);
  const endIdx   = WEEKDAY_ORDER.indexOf(weekEnd);
  if (startIdx === -1 || endIdx === -1) return WEEKDAY_ORDER;

  const days = [];
  let i = startIdx;
  // walk forward through the cycle until we hit endIdx
  while (true) {
    days.push(WEEKDAY_ORDER[i]);
    if (i === endIdx) break;
    i = (i + 1) % 7;
    // safety net if start===end we stop after 1; otherwise guard against
    // running away (shouldn't happen since WEEKDAY_ORDER is length 7)
    if (days.length > 7) break;
  }
  return days;
};

/**
 * Anchor date: the date (in the current calendar week) corresponding to
 * `weekStart` for the week containing `date`.
 */
export const anchorWeekStart = (date, weekStart = 'monday') => {
  const target = WEEKDAY_ORDER.indexOf(weekStart);
  const d = new Date(date);
  const currentKey = DAY_KEY_BY_INDEX[d.getDay()];
  const current = WEEKDAY_ORDER.indexOf(currentKey);
  const diffToMonday = (current + 7) % 7;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + target);
  return d;
};

/** YYYY-MM-DD for a Date (local, not UTC-shifted). */
export const toKey = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parse YYYY-MM-DD as a local Date (avoid TZ shift). */
export const fromKey = (key) => {
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

/** Shift a week-start key by ±n weeks. */
export const shiftWeek = (key, offset) => {
  const d = fromKey(key) || new Date();
  d.setDate(d.getDate() + offset * 7);
  return toKey(d);
};
// ---------- backend <-> frontend mapping ----------
export const normalizeTask = (t) => ({
  ...t,
  due_date: t.due_date ? String(t.due_date).split('T')[0] : t.due_date,
  meeting_time: (t.meeting_time || '').slice(0, 5),   // "09:30:00" → "09:30"
  period: t.period || null,
  repeat: {
    preset: t.repeat_preset ?? 'none',
    days: t.repeat_days ?? [],
  },
});

export const denormalizeTask = (form) => {
  const { repeat, meeting_time, period, ...rest } = form;

  // Backend rule is 'H:i' (HH:MM, no seconds).
  // <input type="time"> may yield "HH:MM" or "HH:MM:SS"; normalize to "HH:MM".
  let mt = null;
  if (meeting_time) {
    mt = String(meeting_time).slice(0, 5);   // "09:30:00" → "09:30", "09:30" → "09:30"
  }

  return {
    ...rest,
    meeting_time: mt,
    period: period || null,
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

export const describePeriod = (period) => {
  if (!period) return null;
  const found = PERIODS.find((p) => p.value === period);
  return found ? `${PERIOD_ICON[period] || ''} ${found.label}`.trim() : period;
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

/** First day of the month containing `date` (local). */
export const startOfMonth = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
};

/** Last day of the month containing `date` (local). */
export const endOfMonth = (date) => {
  const d = startOfMonth(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d;
};

/** Shift a Date by ±n months. */
export const shiftMonth = (date, offset) => {
  const d = new Date(date);
  d.setDate(1);              // avoid month-end rollover surprises
  d.setMonth(d.getMonth() + offset);
  return d;
};

/** Every day of the month containing `date`, as Date objects. */
export const daysOfMonth = (date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const out = [];
  const cur = new Date(start);
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

/** Short label for a day in a month bar chart (e.g. "5"). */
export const dayLabel = (d) => String(d.getDate());

/** Month title, e.g. "October 2026". */
export const monthLabel = (d) =>
  d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });