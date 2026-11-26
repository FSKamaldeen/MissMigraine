import { useMemo } from 'react';

// ─────────────────────────────────────────────────────
// Range helpers
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

function getRangeLabel(range) {
  switch (range) {
    case 'week':
      return 'This week';
    case 'month':
      return 'This month';
    case '3m':
      return 'Last 3 months';
    case 'year':
      return 'This year';
    default:
      return '';
  }
}

// ─────────────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────────────

export function useMedicationInsights(range, logs) {
  return useMemo(() => {
    const now = new Date();
    const rangeStart = getRangeStart(range, now);

    const rangeLogs = (logs || []).filter(
      (log) => new Date(log.dateTime) >= rangeStart
    );

    const totalLogs = rangeLogs.length;
    const logsWithMeds = rangeLogs.filter(
      (log) => log.medications && log.medications.length > 0
    );
    const logsWithoutMeds = rangeLogs.filter(
      (log) => !log.medications || log.medications.length === 0
    );

    const logsWithMedsCount = logsWithMeds.length;

    // ─── Usage ranking ────────────────────────────────
    const usageCounts = {};
    logsWithMeds.forEach((log) => {
      (log.medications || []).forEach((med) => {
        usageCounts[med] = (usageCounts[med] || 0) + 1;
      });
    });

    const medications = Object.entries(usageCounts)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalLogs ? Math.round((count / totalLogs) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const maxUsage = medications[0]?.count || 1;

    // ─── Duration with vs. without meds ───────────────
    const avgDuration = (arr) => {
      const usable = arr.filter(
        (log) => typeof log.durationHours === 'number' && log.durationHours > 0
      );
      if (usable.length === 0) return null;
      const total = usable.reduce((sum, log) => sum + log.durationHours, 0);
      return Number((total / usable.length).toFixed(1));
    };

    const durationWithMeds = avgDuration(logsWithMeds);
    const durationWithoutMeds = avgDuration(logsWithoutMeds);

    const hasDurationData =
      durationWithMeds != null && durationWithoutMeds != null;

    const maxDuration = hasDurationData
      ? Math.max(durationWithMeds, durationWithoutMeds)
      : 1;

    // ─── Duration insight ─────────────────────────────
    let durationInsight = null;
    if (hasDurationData) {
      const diff = durationWithMeds - durationWithoutMeds;
      if (diff <= -0.5) {
        durationInsight =
          "Your migraines tend to run shorter when medication is involved. This isn't proof it's working — but it's a signal worth noting.";
      } else if (diff >= 0.5) {
        durationInsight =
          'Your migraines tend to run longer when medication is involved. This could just be because you take medication for your worse attacks.';
      } else {
        durationInsight =
          'Duration looks roughly the same with and without medication. Not enough signal to draw a conclusion yet.';
      }
    }

    return {
      rangeLabel: getRangeLabel(range),
      totalLogs,
      logsWithMedsCount,
      medications,
      maxUsage,
      hasDurationData,
      durationWithMeds,
      durationWithoutMeds,
      maxDuration,
      durationInsight,
    };
  }, [range, logs]);
}