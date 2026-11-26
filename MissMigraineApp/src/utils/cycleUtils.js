import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_OVULATION_DAY,
  DEFAULT_MENSTRUAL_LENGTH,
  PERIMENSTRUAL_BEFORE,
  PERIMENSTRUAL_AFTER,
  OVULATION_WINDOW,
  CYCLE_VALIDATION,
} from '../constants/cyclePhases';
import {
  addDays,
  atStartOfDay,
  differenceInDays,
  parseInputDate,
  toDateInputValue,
} from './dateUtils';

// ─────────────────────────────────────────────────────
// Phase segments
// ─────────────────────────────────────────────────────

export function getCycleSegments(cycleLength, ovulationDayValue) {
  const length = Math.max(1, Number(cycleLength) || DEFAULT_CYCLE_LENGTH);

  const menstrualEnd = Math.min(DEFAULT_MENSTRUAL_LENGTH, length);

  const parsedOvulation = Number.parseInt(ovulationDayValue, 10);
  const ovulationDay = Number.isFinite(parsedOvulation)
    ? Math.min(Math.max(parsedOvulation, menstrualEnd + 1), length)
    : Math.min(Math.max(length - 14, menstrualEnd + 1), length);

  const ovulationStart = Math.max(menstrualEnd + 1, ovulationDay - OVULATION_WINDOW);
  const ovulationEnd = Math.min(length, ovulationDay + OVULATION_WINDOW);

  const follicularLength = Math.max(0, ovulationStart - (menstrualEnd + 1));
  const lutealLength = Math.max(0, length - ovulationEnd);

  return [
    {
      key: 'menstrual',
      label: 'Menstrual',
      length: menstrualEnd,
      startDay: 1,
      endDay: menstrualEnd,
    },
    {
      key: 'follicular',
      label: 'Follicular',
      length: follicularLength,
      startDay: menstrualEnd + 1,
      endDay: ovulationStart - 1,
    },
    {
      key: 'ovulatory',
      label: 'Ovulatory',
      length: Math.max(0, ovulationEnd - ovulationStart + 1),
      startDay: ovulationStart,
      endDay: ovulationEnd,
    },
    {
      key: 'luteal',
      label: 'Luteal',
      length: lutealLength,
      startDay: ovulationEnd + 1,
      endDay: length,
    },
  ].filter((segment) => segment.length > 0);
}

export function getPhaseKeyForDay(cycleLength, ovulationDay, dayInCycle) {
  const segments = getCycleSegments(cycleLength, ovulationDay);
  for (const segment of segments) {
    if (dayInCycle >= segment.startDay && dayInCycle <= segment.endDay) {
      return segment.key;
    }
  }
  return 'luteal';
}

// ─────────────────────────────────────────────────────
// Cycle summary
// ─────────────────────────────────────────────────────

/**
 * Given cycle data and a reference date (defaults to now),
 * returns a full summary of the user's current cycle state.
 *
 * Returns null if there isn't enough data (no lastPeriodStartDate).
 *
 * @param {Object} cycleData - { lastPeriodStartDate, averageCycleLength, ovulationDay }
 * @param {Date}   referenceDate - defaults to new Date()
 * @param {Object} phaseOverrides - optional map of { "YYYY-MM-DD": phaseKey } for manual overrides
 */
export function getCycleSummary(
  cycleData,
  referenceDate = new Date(),
  phaseOverrides = {}
) {
  if (!cycleData?.lastPeriodStartDate) return null;

  const startDate = parseInputDate(cycleData.lastPeriodStartDate);
  if (!startDate) return null;

  const cycleLength = Math.max(
    1,
    Number.parseInt(cycleData.averageCycleLength, 10) || DEFAULT_CYCLE_LENGTH
  );

  const daysSinceStart = differenceInDays(startDate, referenceDate);

  // Normalize into [0, cycleLength) even if reference is before start.
  const normalizedDayIndex =
    ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;

  const dayInCycle = normalizedDayIndex + 1;

  // The cycle-start date for the current cycle round.
  const cycleStartThisRound = addDays(startDate, daysSinceStart - normalizedDayIndex);

  const nextPeriodDate = addDays(cycleStartThisRound, cycleLength);
  const perimenstrualStartDate = addDays(nextPeriodDate, -PERIMENSTRUAL_BEFORE);
  const perimenstrualEndDate = addDays(nextPeriodDate, PERIMENSTRUAL_AFTER);

  const isPerimenstrualWindow =
    atStartOfDay(referenceDate).getTime() >= atStartOfDay(perimenstrualStartDate).getTime() &&
    atStartOfDay(referenceDate).getTime() <= atStartOfDay(perimenstrualEndDate).getTime();

  const segments = getCycleSegments(cycleLength, cycleData.ovulationDay);

  let phaseKey = getPhaseKeyForDay(cycleLength, cycleData.ovulationDay, dayInCycle);

  // Apply manual override if present for today
  const todayKey = toDateInputValue(atStartOfDay(referenceDate));
  if (phaseOverrides[todayKey]) {
    phaseKey = phaseOverrides[todayKey];
  }

  return {
    phaseKey,
    dayInCycle,
    cycleLength,
    isPerimenstrualWindow,
    nextPeriodDate: toDateInputValue(nextPeriodDate),
    perimenstrualStartDate: toDateInputValue(perimenstrualStartDate),
    perimenstrualEndDate: toDateInputValue(perimenstrualEndDate),
    ovulationDay:
      Number.parseInt(cycleData.ovulationDay, 10) ||
      Math.min(Math.max(cycleLength - 14, 1), cycleLength),
    segments,
  };
}

// ─────────────────────────────────────────────────────
// Calendar building
// ─────────────────────────────────────────────────────

export function getCalendarDays(cycleData, phaseOverrides, monthDate = new Date()) {
  const today = new Date();
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const calendarDays = [];

  const mondayStartOffset = (monthStart.getDay() + 6) % 7;
  for (let i = 0; i < mondayStartOffset; i += 1) {
    calendarDays.push({ key: `empty-${i}`, empty: true });
  }

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const summary = getCycleSummary(cycleData, date, phaseOverrides);
    const dateKey = toDateInputValue(date);

    calendarDays.push({
      key: dateKey,
      empty: false,
      date,
      dateKey,
      dayNumber: day,
      phaseKey: summary?.phaseKey || null,
      isToday: toDateInputValue(date) === toDateInputValue(today),
      isPerimenstrualWindow: Boolean(summary?.isPerimenstrualWindow),
    });
  }

  return {
    monthLabel: monthStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    days: calendarDays,
  };
}

// ─────────────────────────────────────────────────────
// Migration helper
// ─────────────────────────────────────────────────────

export function validateCycleInput({
  lastPeriodStartDate,
  lastPeriodEndDate,
  averageCycleLength,
  ovulationDay,
}) {
  if (!lastPeriodStartDate?.trim()) {
    return { valid: false, error: 'Please add the first day of your last period.' };
  }

  const start = parseInputDate(lastPeriodStartDate.trim());
  if (!start) {
    return { valid: false, error: 'Please enter the date as YYYY-MM-DD.' };
  }

  if (lastPeriodEndDate?.trim()) {
    const end = parseInputDate(lastPeriodEndDate.trim());
    if (!end) {
      return { valid: false, error: 'Please enter the end date as YYYY-MM-DD or leave it blank.' };
    }
    if (end < start) {
      return { valid: false, error: 'End date cannot be before start date.' };
    }
  }

  const parsedLength = Number.parseInt(averageCycleLength, 10);
  if (
    !parsedLength ||
    parsedLength < CYCLE_VALIDATION.minCycleLength ||
    parsedLength > CYCLE_VALIDATION.maxCycleLength
  ) {
    return {
      valid: false,
      error: `Please enter an average cycle length between ${CYCLE_VALIDATION.minCycleLength} and ${CYCLE_VALIDATION.maxCycleLength} days.`,
    };
  }

  const parsedOvulation = Number.parseInt(ovulationDay, 10);
  if (!parsedOvulation || parsedOvulation < 1 || parsedOvulation > parsedLength) {
    return {
      valid: false,
      error: 'Please enter an ovulation day within your cycle length.',
    };
  }

  return { valid: true, error: null };
}