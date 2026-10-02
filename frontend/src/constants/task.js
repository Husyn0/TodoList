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