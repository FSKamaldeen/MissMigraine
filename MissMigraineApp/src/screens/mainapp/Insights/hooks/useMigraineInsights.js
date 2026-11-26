import { useMemo } from 'react';
import { getIntensityColor } from '../../../../constants/colors';

export const RANGE_OPTIONS = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: '3m', label: 'Last 3 months' },
  { key: 'year', label: 'This year' },
];

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

export function useMigraineInsights(range, logs) {
  return useMemo(() => {
    const now = new Date();
    const rangeStart = getRangeStart(range, now);

    const rangeLogs = (logs || []).filter(
      (log) => new Date(log.dateTime) >= rangeStart
    );

    const count = rangeLogs.length;

    // ─── Stats ────────────────────────────────────────
    const avgIntensity = count
      ? (rangeLogs.reduce((s, l) => s + (l.intensity || 0), 0) / count).toFixed(1)
      : '0.0';

    const withDuration = rangeLogs.filter((l) => l.durationHours != null);
    const avgDuration = withDuration.length
      ? (withDuration.reduce((s, l) => s + l.durationHours, 0) / withDuration.length).toFixed(1)
      : '0.0';

    const auraPercent = count
      ? Math.round((rangeLogs.filter((l) => l.auraPresent).length / count) * 100)
      : 0;

    // ─── Severity ─────────────────────────────────────
    const mild = rangeLogs.filter((l) => l.intensity <= 3).length;
    const moderate = rangeLogs.filter((l) => l.intensity >= 4 && l.intensity <= 6).length;
    const severe = rangeLogs.filter((l) => l.intensity >= 7).length;

    const severity = [
      { key: 'mild', label: 'Mild', count: mild, percent: count ? Math.round((mild / count) * 100) : 0, color: getIntensityColor(2) },
      { key: 'moderate', label: 'Moderate', count: moderate, percent: count ? Math.round((moderate / count) * 100) : 0, color: getIntensityColor(5) },
      { key: 'severe', label: 'Severe', count: severe, percent: count ? Math.round((severe / count) * 100) : 0, color: getIntensityColor(9) },
    ];

    // ─── Symptoms ─────────────────────────────────────
    const symptomCounts = {};
    rangeLogs.forEach((log) => {
      (log.symptoms || []).forEach((s) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });
    const symptoms = Object.entries(symptomCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const maxSymptomCount = symptoms[0]?.value || 1;

    // ─── Triggers ─────────────────────────────────────
    const triggerCounts = {};
    rangeLogs.forEach((log) => {
      (log.triggers || []).forEach((t) => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });
    const triggers = Object.entries(triggerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const maxTriggerCount = triggers[0]?.value || 1;

    // ─── Insight ──────────────────────────────────────
    let insight = '';
    if (count === 0) {
      insight = "No migraines in this period. That's good news.";
    } else if (severe > moderate && severe > mild) {
      insight = 'Most of your migraines were severe this period.';
    } else if (auraPercent >= 50) {
      insight = `You had aura in ${auraPercent}% of your migraines.`;
    } else if (parseFloat(avgDuration) > 6) {
      insight = "Your attacks averaged over 6 hours. That's long.";
    } else if (symptoms.length > 0) {
      insight = `${symptoms[0].name} was your most common symptom this period.`;
    } else {
      insight = 'Keep logging to unlock more pattern insights.';
    }

    // ─── Severe-only top symptom & trigger ────────────────
    const severeLogs = rangeLogs.filter((l) => l.intensity >= 7);

    const severeSymptomCounts = {};
    severeLogs.forEach((log) => {
      (log.symptoms || []).forEach((s) => {
        severeSymptomCounts[s] = (severeSymptomCounts[s] || 0) + 1;
      });
    });
    const topSevereSymptom = Object.entries(severeSymptomCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)[0] || null;

    const severeTriggerCounts = {};
    severeLogs.forEach((log) => {
      (log.triggers || []).forEach((t) => {
        severeTriggerCounts[t] = (severeTriggerCounts[t] || 0) + 1;
      });
    });
    const topSevereTrigger = Object.entries(severeTriggerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)[0] || null;

    const severeCount = severeLogs.length;

    return {
      count,
      avgIntensity,
      avgDuration,
      auraPercent,
      severity,
      symptoms,
      maxSymptomCount,
      triggers,
      maxTriggerCount,
      insight,
      severeCount,
      topSevereSymptom,
      topSevereTrigger,
    };
  }, [range, logs]);
}