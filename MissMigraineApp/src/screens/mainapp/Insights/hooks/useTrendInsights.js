import { useMemo } from 'react';

// ─────────────────────────────────────────────────────
// Range helpers — calendar-aligned
// ─────────────────────────────────────────────────────

function getRangeStart(range, now = new Date()) {
  const d = new Date(now);

  switch (range) {
    case 'week': {
      const dow = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - dow);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'month':
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    case '3m':
      d.setMonth(d.getMonth() - 2);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    case 'year':
      d.setMonth(0);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      return d;
    default:
      d.setHours(0, 0, 0, 0);
      return d;
  }
}

/**
 * Previous period mirrors the current one:
 *   week   → previous calendar week
 *   month  → previous calendar month
 *   3m     → previous 3 calendar months
 *   year   → previous calendar year
 */
function getPreviousRange(range, now = new Date()) {
  const currentStart = getRangeStart(range, now);
  const prevEnd = new Date(currentStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  prevEnd.setHours(23, 59, 59, 999);

  let prevStart;
  switch (range) {
    case 'week': {
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 6);
      prevStart.setHours(0, 0, 0, 0);
      break;
    }
    case 'month': {
      prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
      break;
    }
    case '3m': {
      prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth() - 2, 1);
      break;
    }
    case 'year': {
      prevStart = new Date(prevEnd.getFullYear(), 0, 1);
      break;
    }
    default: {
      prevStart = new Date(prevEnd);
      prevStart.setHours(0, 0, 0, 0);
    }
  }

  return { prevStart, prevEnd };
}

function getRangeLabel(range) {
  switch (range) {
    case 'week':
      return 'this week';
    case 'month':
      return 'this month';
    case '3m':
      return 'last 3 months';
    case 'year':
      return 'this year';
    default:
      return '';
  }
}

// ─────────────────────────────────────────────────────
// Bucket builders
// ─────────────────────────────────────────────────────

function buildDailyBuckets(rangeStart, now, logs) {
  const buckets = [];
  const cursor = new Date(rangeStart);
  while (cursor <= now) {
    const key = cursor.toISOString().split('T')[0];
    const count = logs.filter(
      (log) => new Date(log.dateTime).toISOString().split('T')[0] === key
    ).length;
    buckets.push({
      key,
      label: cursor.getDate().toString(),
      count,
      date: new Date(cursor),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return buckets;
}

function buildWeeklyBuckets(rangeStart, now, logs) {
  const buckets = [];
  const cursor = new Date(rangeStart);
  const dow = (cursor.getDay() + 6) % 7;
  cursor.setDate(cursor.getDate() - dow);

  let index = 1;
  while (cursor <= now) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const count = logs.filter((log) => {
      const d = new Date(log.dateTime);
      return d >= weekStart && d <= weekEnd;
    }).length;

    buckets.push({
      key: weekStart.toISOString().split('T')[0],
      label: `W${index}`,
      count,
      date: new Date(weekStart),
    });

    cursor.setDate(cursor.getDate() + 7);
    index += 1;
  }
  return buckets;
}

function buildMonthlyBuckets(rangeStart, now, logs) {
  const buckets = [];
  const cursor = new Date(rangeStart);
  cursor.setDate(1);

  while (cursor <= now) {
    const monthStart = new Date(cursor);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

    const count = logs.filter((log) => {
      const d = new Date(log.dateTime);
      return d >= monthStart && d <= monthEnd;
    }).length;

    buckets.push({
      key: monthStart.toISOString().split('T')[0],
      label: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      count,
      date: new Date(monthStart),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}

function buildBuckets(range, logs, now = new Date()) {
  const rangeStart = getRangeStart(range, now);

  if (range === 'week' || range === 'month') {
    return buildDailyBuckets(rangeStart, now, logs);
  }
  if (range === '3m') return buildWeeklyBuckets(rangeStart, now, logs);
  if (range === 'year') return buildMonthlyBuckets(rangeStart, now, logs);

  // Single bucket for 'day'
  const key = now.toISOString().split('T')[0];
  const count = logs.filter(
    (log) => new Date(log.dateTime).toISOString().split('T')[0] === key
  ).length;
  return [{ key, label: 'Today', count, date: new Date(now) }];
}

// ─────────────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────────────

export function useTrendInsights(range, logs) {
  return useMemo(() => {
    const now = new Date();

    const rangeStart = getRangeStart(range, now);
    const currentLogs = (logs || []).filter(
      (log) => new Date(log.dateTime) >= rangeStart
    );

    const { prevStart, prevEnd } = getPreviousRange(range, now);
    const previousLogs = (logs || []).filter((log) => {
      const d = new Date(log.dateTime);
      return d >= prevStart && d <= prevEnd;
    });

    const currentTotal = currentLogs.length;
    const previousTotal = previousLogs.length;

    const buckets = buildBuckets(range, logs, now);
    const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1);

    // Best and worst bucket (ignore all-zero buckets)
    const nonEmpty = buckets.filter((b) => b.count > 0);
    const worst = nonEmpty.length
      ? nonEmpty.reduce(
          (max, b) => (b.count > max.count ? b : max),
          nonEmpty[0]
        )
      : null;
    const best = nonEmpty.length
      ? nonEmpty.reduce(
          (min, b) => (b.count < min.count ? b : min),
          nonEmpty[0]
        )
      : null;

    const average =
      buckets.length > 0
        ? (currentTotal / buckets.length).toFixed(1)
        : '0.0';

    // Comparison
    const hasPrevious = previousTotal > 0;
    const diff = currentTotal - previousTotal;
    const diffPercent = hasPrevious
      ? Math.round((Math.abs(diff) / previousTotal) * 100)
      : 0;

    let comparisonLine = '';
    if (!hasPrevious && currentTotal === 0) {
      comparisonLine = 'No data in either period.';
    } else if (!hasPrevious) {
      comparisonLine = 'No migraines in the previous period to compare against.';
    } else if (diff === 0) {
      comparisonLine = 'Holding steady compared to the previous period.';
    } else if (diff > 0) {
      comparisonLine = `Up ${diffPercent}% compared to the previous period.`;
    } else {
      comparisonLine = `Down ${diffPercent}% compared to the previous period.`;
    }

    const bucketNoun =
      range === 'week' || range === 'month'
        ? 'day'
        : range === '3m'
        ? 'week'
        : range === 'year'
        ? 'month'
        : 'day';

    return {
      rangeLabel: getRangeLabel(range),
      currentTotal,
      previousTotal,
      comparisonLine,
      buckets,
      maxBucketCount,
      average,
      worst,
      best,
      bucketNoun,
    };
  }, [range, logs]);
}