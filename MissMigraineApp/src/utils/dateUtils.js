// ─────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────

/* Converts a Date to "YYYY-MM-DD" string (local) */
export function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* Parses "YYYY-MM-DD" into a Date at local midnight.
 * Returns null if the string is invalid. */
export function parseInputDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/* Formats a Date or "YYYY-MM-DD" string as "Mar 5, 2026" */
export function formatShortDate(value) {
  const date = typeof value === 'string' ? parseInputDate(value) : value;
  if (!date || Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* Formats a Date or "YYYY-MM-DD" string as "March 5, 2026" */
export function formatLongDate(value) {
  const date = typeof value === 'string' ? parseInputDate(value) : value;
  if (!date || Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* Formats an ISO datetime string as "March 5, 2026 · 9:30 PM"
 * Automatically converts the UTC timestamp to the device's local timezone. */
export function formatDateTimeLabel(value) {
  if (!value) return 'Not set';
  // new Date() correctly parses ISO strings with a trailing "Z" (UTC)
  // and toLocaleString() renders them in the local timezone.
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';
  return date
    .toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    .replace(',', ' ·');
}

/* Returns a friendly relative label: "Today", "Yesterday", "5 days ago" */
export function formatRelativeDate(value) {
  const date = typeof value === 'string' ? parseInputDate(value) : value;
  if (!date) return '';

  const days = differenceInDays(date, new Date());
  const absDays = Math.abs(days);

  if (days === 0) return 'Today';
  if (days === -1) return 'Yesterday';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${absDays} days ago`;
  return `In ${absDays} days`;
}

// ─────────────────────────────────────────────────────
// Arithmetic
// ─────────────────────────────────────────────────────

/* Returns a new Date with `days` added */
export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/* Returns a new Date set to midnight of the given date */
export function atStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/* Days between two dates (end - start). Time-of-day is ignored. */
export function differenceInDays(startDate, endDate) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.floor(
    (atStartOfDay(endDate).getTime() - atStartOfDay(startDate).getTime()) / MS_PER_DAY
  );
}

/* Same-day check. Time-of-day ignored */
export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* True if `date` is strictly between start and end (inclusive of both) */
export function isBetween(date, start, end) {
  if (!start || !end) return false;
  const t = atStartOfDay(date).getTime();
  const s = atStartOfDay(start).getTime();
  const e = atStartOfDay(end).getTime();
  return t >= Math.min(s, e) && t <= Math.max(s, e);
}

// ─────────────────────────────────────────────────────
// Month helpers
// ─────────────────────────────────────────────────────

/* Returns the first day of the month containing `date` */
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/* Returns the last day of the month containing `date` */
export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/* Adds `months` to a date, snapping to the 1st of the target month */
export function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/* "March 2026" style label for the month containing `date` */
export function formatMonthLabel(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────
// Extras that come up often
// ─────────────────────────────────────────────────────

/* "9:30 PM" from an ISO string or Date */
export function formatTimeLabel(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid time';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/* Returns the input as a native Date, or null. Handy when you need
 * to pass an ISO string into the DateTimePicker (which only accepts Date). */
export function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}