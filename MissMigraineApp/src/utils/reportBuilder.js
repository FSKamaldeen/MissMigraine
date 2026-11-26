import { CYCLE_PHASE_META } from '../constants/colors';

// ─────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────

export function getRangeStart(range) {
  const now = new Date();
  const start = new Date(now);
  switch (range) {
    case 'week': start.setDate(now.getDate() - 7); break;
    case 'month': start.setDate(now.getDate() - 30); break;
    case '3m': start.setDate(now.getDate() - 90); break;
    case '6m': start.setDate(now.getDate() - 180); break;
    default: start.setDate(now.getDate() - 30);
  }
  return start;
}

export const RANGE_LABELS = {
  week: 'Last 7 days',
  month: 'Last 30 days',
  '3m': 'Last 3 months',
  '6m': 'Last 6 months',
};

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─────────────────────────────────────────────────────
// Data computation
// ─────────────────────────────────────────────────────

export function computeReportData(logs, range) {
  const start = getRangeStart(range);

  const filteredLogs = logs
    .filter((log) => new Date(log.dateTime) >= start)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const count = filteredLogs.length;

  // Stats
  let stats = { count: 0, avgIntensity: '0', avgDuration: '0', auraPercent: 0 };
  if (count > 0) {
    const avgIntensity = (filteredLogs.reduce((s, l) => s + l.intensity, 0) / count).toFixed(1);
    const avgDuration = (filteredLogs.reduce((s, l) => s + (l.durationHours || 0), 0) / count).toFixed(1);
    const auraPercent = Math.round((filteredLogs.filter((l) => l.auraPresent).length / count) * 100);
    stats = { count, avgIntensity, avgDuration, auraPercent };
  }

  // Phase breakdown
  const phaseCounts = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
  filteredLogs.forEach((log) => {
    if (log.cyclePhaseKey && phaseCounts[log.cyclePhaseKey] !== undefined) {
      phaseCounts[log.cyclePhaseKey] += 1;
    }
  });
  const total = count || 1;
  const phaseBreakdown = Object.entries(phaseCounts).map(([key, c]) => ({
    key,
    label: CYCLE_PHASE_META[key]?.name || key,
    count: c,
    percent: Math.round((c / total) * 100),
  }));

  // Top symptoms
  const symptomCounts = {};
  filteredLogs.forEach((log) => {
    (log.symptoms || []).forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top triggers
  const triggerCounts = {};
  filteredLogs.forEach((log) => {
    (log.triggers || []).forEach((t) => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  const topTriggers = Object.entries(triggerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Correlation insight
  let correlationInsight = null;
  if (count >= 3) {
    const top = phaseBreakdown.reduce(
      (best, p) => (p.count > best.count ? p : best),
      phaseBreakdown[0]
    );
    if (top && top.count > 0) {
      const expectedPercent = 25;
      const ratio = top.percent / expectedPercent;
      if (ratio >= 1.3) {
        const roundedRatio = ratio.toFixed(1);
        correlationInsight = `${top.label} migraines occurred ${roundedRatio}× more often than would be expected if attacks were evenly spread across the cycle. This is a pattern worth noting, though more data helps confirm it.`;
      }
    }
  }

  return {
    filteredLogs,
    stats,
    phaseBreakdown,
    topSymptoms,
    topTriggers,
    correlationInsight,
  };
}

// ─────────────────────────────────────────────────────
// HTML builder
// ─────────────────────────────────────────────────────

export function buildReportHTML({ user, rangeLabel, startDate, endDate, logs, stats, phaseBreakdown, topSymptoms, topTriggers, correlationInsight }) {
  const logRows = logs
    .map((log) => {
      const phase = CYCLE_PHASE_META[log.cyclePhaseKey]?.name || 'Not recorded';
      const symptoms = log.symptoms?.length ? log.symptoms.join(', ') : '—';
      const triggers = log.triggers?.length ? log.triggers.join(', ') : '—';
      const medications = log.medications?.length ? log.medications.join(', ') : '—';
      const duration = log.durationHours ? `${log.durationHours}h` : 'Ongoing';
      return `
        <tr>
          <td>${formatDate(log.dateTime)}</td>
          <td>${log.intensity}/10</td>
          <td>${duration}</td>
          <td>${phase}</td>
          <td>${symptoms}</td>
          <td>${triggers}</td>
          <td>${medications}</td>
        </tr>
      `;
    })
    .join('');

  const phaseRows = phaseBreakdown
    .filter((p) => p.count > 0)
    .map(
      (p) => `
      <tr>
        <td>${p.label}</td>
        <td>${p.count}</td>
        <td>${p.percent}%</td>
      </tr>
    `
    )
    .join('');

  const symptomRows = topSymptoms
    .map((s) => `<tr><td>${s.name}</td><td>${s.count}</td></tr>`)
    .join('');

  const triggerRows = topTriggers
    .map((t) => `<tr><td>${t.name}</td><td>${t.count}</td></tr>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { margin: 40px; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; font-size: 12px; line-height: 1.5; }
        h1 { font-size: 24px; margin: 0 0 4px; color: #5f2f9d; }
        .subtitle { color: #666; font-size: 13px; margin: 0 0 24px; }
        .section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5f2f9d; margin: 24px 0 12px; border-bottom: 1px solid #e0d8f0; padding-bottom: 6px; }
        .stats-grid { display: flex; gap: 12px; margin-bottom: 8px; }
        .stat-box { flex: 1; background: #f7f3fc; border-radius: 8px; padding: 12px; text-align: center; }
        .stat-value { font-size: 22px; font-weight: 700; color: #5f2f9d; }
        .stat-label { font-size: 11px; color: #666; margin-top: 2px; }
        .two-col { display: flex; gap: 16px; }
        .two-col > div { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10.5px; }
        th { background: #5f2f9d; color: white; text-align: left; padding: 8px 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 8px 6px; border-bottom: 1px solid #ece6f7; vertical-align: top; }
        tr:nth-child(even) td { background: #faf7fe; }
        .insight { background: #f7f3fc; border-left: 3px solid #5f2f9d; padding: 12px; font-size: 11.5px; color: #333; margin-top: 12px; border-radius: 4px; }
        .empty { color: #888; font-style: italic; padding: 16px; text-align: center; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e0d8f0; font-size: 10px; color: #888; text-align: center; }
        .disclaimer { background: #fef7e6; border-left: 3px solid #f0a84c; padding: 12px; font-size: 11px; color: #555; margin-top: 24px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Migraine Report</h1>
      <p class="subtitle">
        <strong>${user.full_name || user.preferred_name || 'Miss Migraine user'}</strong> · ${rangeLabel} · ${startDate} – ${endDate}
      </p>

      <div class="section-title">Summary</div>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${stats.count}</div>
          <div class="stat-label">Migraines</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.avgIntensity}/10</div>
          <div class="stat-label">Avg intensity</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.avgDuration}h</div>
          <div class="stat-label">Avg duration</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${stats.auraPercent}%</div>
          <div class="stat-label">With aura</div>
        </div>
      </div>

      ${
        stats.count > 0
          ? `
        <div class="section-title">Migraines by Cycle Phase</div>
        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Count</th>
              <th>% of total</th>
            </tr>
          </thead>
          <tbody>${phaseRows}</tbody>
        </table>
        ${correlationInsight ? `<div class="insight">${correlationInsight}</div>` : ''}
      `
          : ''
      }

      ${
        stats.count > 0 && (topSymptoms.length > 0 || topTriggers.length > 0)
          ? `
        <div class="two-col">
          <div>
            <div class="section-title">Most Common Symptoms</div>
            ${
              topSymptoms.length > 0
                ? `<table>
                    <thead>
                      <tr><th>Symptom</th><th>Count</th></tr>
                    </thead>
                    <tbody>${symptomRows}</tbody>
                  </table>`
                : `<div class="empty">No symptoms recorded</div>`
            }
          </div>
          <div>
            <div class="section-title">Most Common Triggers</div>
            ${
              topTriggers.length > 0
                ? `<table>
                    <thead>
                      <tr><th>Trigger</th><th>Count</th></tr>
                    </thead>
                    <tbody>${triggerRows}</tbody>
                  </table>`
                : `<div class="empty">No triggers recorded</div>`
            }
          </div>
        </div>
      `
          : ''
      }

      <div class="section-title">Migraine Log</div>
      ${
        logs.length > 0
          ? `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Intensity</th>
              <th>Duration</th>
              <th>Phase</th>
              <th>Symptoms</th>
              <th>Triggers</th>
              <th>Medications</th>
            </tr>
          </thead>
          <tbody>${logRows}</tbody>
        </table>
      `
          : `<div class="empty">No migraines logged in this period.</div>`
      }

      <div class="disclaimer">
        <strong>About this report:</strong> This is a personal migraine summary generated from self-reported logs. It is not a medical diagnosis and should be interpreted alongside professional advice where appropriate.
      </div>

      <div class="footer">
        Generated by Miss Migraine · ${new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </body>
    </html>
  `;
}