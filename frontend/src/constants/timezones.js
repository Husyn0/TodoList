// src/constants/timezones.js

/**
 * Canonical IANA timezone list.
 * `Intl.supportedValuesOf('timeZone')` is available in all modern browsers
 * (Chrome 99+, Firefox 93+, Safari 15.4+, Edge 99+).
 * Fallback below covers older runtimes with the most common zones.
 */
const FALLBACK = [
  'UTC',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Sao_Paulo',
  'America/Toronto',
  'Asia/Beirut',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Jerusalem',
  'Asia/Kolkata',
  'Asia/Riyadh',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Melbourne',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Istanbul',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Pacific/Auckland',
];

export const TIMEZONES = (() => {
  try {
    if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
      const list = Intl.supportedValuesOf('timeZone');
      if (Array.isArray(list) && list.length) return list;
    }
  } catch {
    /* noop */
  }
  return FALLBACK;
})();

/** Human-friendly label: "Asia/Beirut (GMT+3)" */
export const formatTimezoneLabel = (tz) => {
  if (!tz) return '';
  try {
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value;
    return offset ? `${tz} (${offset})` : tz;
  } catch {
    return tz;
  }
};

/** The browser's current zone — used as default for new users. */
export const detectTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/**
 * Score a timezone for a given search query.
 * Returns 0 when there's no match.
 */
export const matchScore = (tz, query) => {
  if (!query) return 1;
  const q = query.toLowerCase().replace(/\s+/g, '');
  const target = tz.toLowerCase();
  if (target === q) return 100;
  if (target.startsWith(q)) return 80;
  if (target.includes(`/${q}`)) return 60;
  if (target.includes(q)) return 40;
  // match by city segment only, e.g. "beirut" → "asia/beirut"
  const city = target.split('/').pop();
  if (city.startsWith(q)) return 70;
  return 0;
};