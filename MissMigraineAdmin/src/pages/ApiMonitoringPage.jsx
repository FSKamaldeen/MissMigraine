import { useEffect, useState } from 'react';
import { PageHeader, StatCard } from '../components/ui/PageHeader';
import { fetchApiStats } from '../services/api';

export function ApiMonitoringPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchApiStats().then(setStats);
  }, []);

  const maxBar = stats ? Math.max(...stats.dailyCalls, 1) : 1;

  return (
    <div className="page">
      <PageHeader title="API Monitoring" subtitle="Track API usage and system health" />

      <div className="status-banner status-banner--ok">
        <span aria-hidden>🟢</span> All systems operational
      </div>

      <div className="stat-grid">
        <StatCard icon="🌐" label="Total Calls Today" value={stats?.callsToday ?? '—'} />
        <StatCard icon="📈" label="Calls This Month" value={stats?.callsThisMonth ?? '—'} />
        <StatCard
          icon="⚡"
          label="Rate Limit Status"
          value={stats?.rateLimitStatus === 'healthy' ? 'Healthy' : stats?.rateLimitStatus ?? '—'}
        />
      </div>

      <section className="card section">
        <h2 className="section-title">API calls over time (last 7 days)</h2>
        <div className="bar-chart" role="img" aria-label="Bar chart of daily API calls">
          {(stats?.dailyCalls ?? []).map((value, i) => (
            <div key={i} className="bar-chart__col">
              <div
                className="bar-chart__bar"
                style={{ height: `${(value / maxBar) * 100}%` }}
                title={`${value} calls`}
              />
              <span className="bar-chart__label">D{i + 1}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
