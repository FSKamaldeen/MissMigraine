import { useEffect, useMemo, useState } from 'react';
import { Activity, TrendingUp, Gauge, ShieldCheck, AlertTriangle } from 'lucide-react';
import { fetchApiStats } from '../services/api';

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-[24px] bg-surface border border-border overflow-hidden">
      <div className={`h-5 w-full ${accent}`} />
      <div className="p-5">
        <p className="text-center font-reem text-4xl text-text-primary leading-none">
          {value}
        </p>
        <p className="mt-2 mb-2 text-center font-plein-medium text-sm text-text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-[24px] bg-surface border border-border p-6 mb-6">
      <div className="mb-5">
        <h2 className="font-reem text-xl text-text-primary">{title}</h2>
        {subtitle && (
          <p className="mt-1 font-plein text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

function dayLabel(offsetFromToday) {
  // 6 = six days ago, 0 = today
  const d = new Date();
  d.setDate(d.getDate() - offsetFromToday);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export function ApiMonitoringPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiStats()
      .then(setStats)
      .catch((err) => console.log('API STATS ERROR:', err))
      .finally(() => setLoading(false));
  }, []);

  const maxBar = useMemo(() => {
    if (!stats?.dailyCalls) return 1;
    return Math.max(...stats.dailyCalls, 1);
  }, [stats]);

  const totalWeekCalls = useMemo(() => {
    return (stats?.dailyCalls || []).reduce((sum, v) => sum + v, 0);
  }, [stats]);

  if (loading) {
    return (
      <div className="py-16 text-center font-plein text-base text-text-muted">
        Loading API stats…
      </div>
    );
  }

  const status = stats?.rateLimitStatus || 'healthy';
  const isHealthy = status === 'healthy';
  const isCritical = status === 'critical';

  // Banner colors depend on status
  const bannerBg = isCritical
    ? 'bg-danger/15 border-danger/40'
    : isHealthy
    ? 'bg-wisteria-800 border-wisteria-700'
    : 'bg-warning/10 border-warning/30';

  const bannerIconBg = isCritical
    ? 'bg-danger/20'
    : isHealthy
    ? 'bg-success/20'
    : 'bg-warning/20';

  const bannerIconColor = isCritical
    ? 'text-danger'
    : isHealthy
    ? 'text-success'
    : 'text-warning';

  const bannerTitle = isCritical
    ? 'Rate limit critical'
    : isHealthy
    ? 'All systems operational'
    : 'Rate limit attention needed';

  const bannerTitleColor = isCritical
    ? 'text-danger'
    : isHealthy
    ? 'text-wisteria-50'
    : 'text-warning';

  return (
    <div>
      {/* Status banner */}
      <div className={`rounded-[24px] ${bannerBg} border p-5 mb-6 flex items-center gap-3`}>
        <div className={`h-10 w-10 flex items-center justify-center rounded-full ${bannerIconBg}`}>
          {isHealthy ? (
            <ShieldCheck size={20} className={bannerIconColor} strokeWidth={2.2} />
          ) : (
            <AlertTriangle size={20} className={bannerIconColor} strokeWidth={2.2} />
          )}
        </div>
        <div>
          <p className={`font-plein-medium text-base ${bannerTitleColor}`}>
            {bannerTitle}
          </p>
          <p className="font-plein text-sm text-wisteria-300 mt-0.5">
            Last checked{' '}
            {new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="API Calls Today"
          value={stats?.callsToday ?? '—'}
          accent="bg-wisteria-300"
        />
        <StatCard
          label="API Calls This Month"
          value={stats?.callsThisMonth ?? '—'}
          accent="bg-wisteria-500"
        />
        <StatCard
          label="Rate Limit Status"
          value={
            isHealthy ? 'Healthy' : isCritical ? 'Critical' : 'Warning'
          }
          accent={isHealthy ? 'bg-success' : isCritical ? 'bg-danger' : 'bg-warning'}
        />
      </div>

      {/* Chart */}
      <Section
        title="API calls over time"
        subtitle={`Last 7 days · ${totalWeekCalls.toLocaleString()} total calls`}
      >
        {!stats?.dailyCalls || stats.dailyCalls.length === 0 ? (
          <p className="py-8 text-center font-plein text-sm text-text-muted">
            No data to display.
          </p>
        ) : (
          <div className="flex items-end justify-between gap-3 h-56 pt-4 pb-2">
            {stats.dailyCalls.map((value, i) => {
              const heightPct = (value / maxBar) * 100;
              const isToday = i === stats.dailyCalls.length - 1;
              const label = isToday ? 'Today' : dayLabel(6 - i);

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full group"
                >
                  <span
                    className={`mb-1.5 font-plein-medium text-xs transition-opacity ${
                      isToday
                        ? 'text-wisteria-200 opacity-100'
                        : 'text-wisteria-300 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {value}
                  </span>

                  <div
                    className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                      isToday
                        ? isCritical
                          ? 'bg-danger'
                          : isHealthy
                          ? 'bg-wisteria-300'
                          : 'bg-warning'
                        : 'bg-wisteria-500/60 group-hover:bg-wisteria-400'
                    }`}
                    style={{
                      height: `${Math.max(heightPct, value > 0 ? 4 : 2)}%`,
                    }}
                    title={`${value} calls`}
                  />

                  <span
                    className={`mt-2 font-plein-medium text-xs ${
                      isToday ? 'text-wisteria-100' : 'text-wisteria-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}