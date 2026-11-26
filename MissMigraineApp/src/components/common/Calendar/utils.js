/**
 * Returns true if two dates fall on the same calendar day.
 */
export function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Returns true if the date is strictly between start and end (inclusive).
 */
export function isBetween(date, start, end) {
  if (!start || !end) return false;
  const t = date.getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t >= Math.min(s, e) && t <= Math.max(s, e);
}

/**
 * Builds a 6x7 grid of cells for the given month.
 * Each cell is { date, isCurrentMonth }.
 */
export function buildCalendarGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first grid
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
    });
  }

  return cells;
}

/**
 * Strip time from a date.
 */
export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}