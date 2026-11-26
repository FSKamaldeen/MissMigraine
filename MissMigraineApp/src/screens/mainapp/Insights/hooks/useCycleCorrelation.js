import { useMemo } from 'react';
import { getCycleSummary } from '../../../../utils/cycleUtils';
import { CYCLE_PHASE_META } from '../../../../constants/colors';

// ─────────────────────────────────────────────────────
// Range helpers
// ─────────────────────────────────────────────────────

function getRangeStart(range, now = new Date()) {
  const d = new Date(now);

  switch (range) {
    case 'day':
      d.setHours(0, 0, 0, 0);
      return d;

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
    case 'day':
      return 'Today';
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
// Verdict computation
// ─────────────────────────────────────────────────────

function computeVerdict(maxEnrichment, totalLogs) {
  if (totalLogs < 5) {
    return {
      level: 'insufficient',
      icon: 'help-circle-outline',
      label: 'Not enough data yet',
      tone: 'neutral',
    };
  }
  if (maxEnrichment >= 2.0) {
    return {
      level: 'notice',
      icon: 'chart-line',
      label: 'A pattern to notice',
      tone: 'informational',
    };
  }
  if (maxEnrichment >= 1.5) {
    return {
      level: 'possible',
      icon: 'magnify',
      label: 'A possible pattern',
      tone: 'informational',
    };
  }
  if (maxEnrichment >= 1.2) {
    return {
      level: 'subtle',
      icon: 'chart-line-variant',
      label: 'A subtle pattern',
      tone: 'informational',
    };
  }
  return {
    level: 'none',
    icon: 'equal',
    label: 'No clear pattern',
    tone: 'neutral',
  };
}

// ─────────────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────────────

export function useCycleCorrelation(range, logs, cycleData) {
  return useMemo(() => {
    const now = new Date();
    const rangeStart = getRangeStart(range, now);

    const rangeLogs = logs.filter(
      (log) => new Date(log.dateTime) >= rangeStart
    );

    const totalLogs = rangeLogs.length;

    // No cycle data → can't compute
    if (!cycleData?.lastPeriodStartDate) {
      return {
        rangeLabel: getRangeLabel(range),
        hasCycleData: false,
        hasEnoughData: totalLogs >= 5,
        totalLogs,
        verdict: computeVerdict(0, totalLogs),
        phaseStats: [],
        topPhase: null,
        nextPeriodDate: null,
        perimenstrualStart: null,
        perimenstrualEnd: null,
      };
    }

    // ─── Count logs per phase ────────────────────────
    const countsByPhase = {
      menstrual: 0,
      follicular: 0,
      ovulatory: 0,
      luteal: 0,
    };

    const daysByPhase = {
      menstrual: 0,
      follicular: 0,
      ovulatory: 0,
      luteal: 0,
    };

    // Count days per phase across the range
    const cursor = new Date(rangeStart);
    while (cursor <= now) {
      const summary = getCycleSummary(cycleData, cursor);
      if (summary?.phaseKey) {
        daysByPhase[summary.phaseKey] += 1;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    // Count logs per phase — prefer the phase recorded at log time,
    // fall back to computing from current cycle data for older logs
    rangeLogs.forEach((log) => {
      const recordedPhase = log.cyclePhaseKey;
      if (recordedPhase && countsByPhase[recordedPhase] !== undefined) {
        countsByPhase[recordedPhase] += 1;
        return;
      }

      const logDate = new Date(log.dateTime);
      const summary = getCycleSummary(cycleData, logDate);
      if (summary?.phaseKey) {
        countsByPhase[summary.phaseKey] += 1;
      }
    });

    // ─── Compute enrichment per phase ────────────────
    const totalDays = Object.values(daysByPhase).reduce((s, v) => s + v, 0);
    const totalMigraines = Object.values(countsByPhase).reduce(
      (s, v) => s + v,
      0
    );

    const phaseStats = Object.entries(CYCLE_PHASE_META).map(([key, meta]) => {
      const count = countsByPhase[key] || 0;
      const days = daysByPhase[key] || 0;

      const actualPct = totalMigraines ? count / totalMigraines : 0;
      const expectedPct = totalDays ? days / totalDays : 0;
      const enrichment = expectedPct > 0 ? actualPct / expectedPct : 0;

      return {
        key,
        label: meta.name,
        color: meta.color,
        emoji: meta.emoji,
        count,
        actualPct: Math.round(actualPct * 100),
        expectedPct: Math.round(expectedPct * 100),
        enrichment: Number(enrichment.toFixed(2)),
      };
    });

    const topPhase = phaseStats.reduce(
      (best, current) =>
        current.enrichment > best.enrichment ? current : best,
      phaseStats[0]
    );

    const maxEnrichment = topPhase?.enrichment || 0;
    const verdict = computeVerdict(maxEnrichment, totalLogs);

    // Perimenstrual window
    const todaySummary = getCycleSummary(cycleData, now);
    const nextPeriodDate = todaySummary?.nextPeriodDate || null;
    const perimenstrualStart = todaySummary?.perimenstrualStartDate || null;
    const perimenstrualEnd = todaySummary?.perimenstrualEndDate || null;

    return {
      rangeLabel: getRangeLabel(range),
      hasCycleData: true,
      hasEnoughData: totalLogs >= 5,
      totalLogs,
      verdict,
      phaseStats,
      topPhase,
      nextPeriodDate,
      perimenstrualStart,
      perimenstrualEnd,
    };
  }, [range, logs, cycleData]);
}