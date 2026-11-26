import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileText,
  Globe,
  ArrowRight,
  BookOpen,
  Download,
  Settings as SettingsIcon,
} from 'lucide-react';
import { fetchApiStats, fetchLogs, fetchUsers } from '../services/api';

// ─────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRole(role) {
  if (!role) return '—';
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ─────────────────────────────────────────────────────
// Badge colors
// ─────────────────────────────────────────────────────

const ROLE_BADGE = {
  admin: 'bg-wisteria-200 text-wisteria-950',
  user: 'bg-wisteria-500/25 text-wisteria-200',
  trusted_person: 'bg-wisteria-400 text-wisteria-950',
};

const STATUS_BADGE = {
  active: 'bg-success/25 text-wisteria-50 border border-success/50',
  inactive: 'bg-wisteria-800 text-wisteria-100 border border-wisteria-600',
};

const ACTION_STATUS_BADGE = {
  success: 'bg-success/25 text-wisteria-50 border border-success/50',
  failure: 'bg-danger/25 text-wisteria-50 border border-danger/50',
  warning: 'bg-warning/20 text-wisteria-950 border border-warning/40',
};

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent, iconBg, iconColor, textColor }) {
  return (
    <div className="rounded-[24px] bg-surface border border-border overflow-hidden">
      <div className={`h-1.5 w-full ${accent}`} />
      <div className="p-5">
        <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${iconBg}`}>
          <Icon size={20} strokeWidth={2.2} className={iconColor} />
        </div>
        <p className={`mt-4 font-reem text-3xl leading-none ${textColor}`}>
          {value}
        </p>
        <p className="mt-2 font-plein-medium text-sm text-text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 font-plein-medium text-xs ${className}`}>
      {children}
    </span>
  );
}

function Section({ title, action, children }) {
  return (
    <div className="rounded-[24px] bg-surface border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-reem text-xl text-text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function SimpleTable({ columns, rows, emptyMessage = 'No data to display.' }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="py-6 text-center font-plein text-sm text-text-muted">
        {emptyMessage}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className="pb-3 text-left font-plein-medium text-xs uppercase tracking-wider text-text-muted">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={row.id || rowIdx} className="border-b border-border/50 last:border-b-0">
              {columns.map((col) => (
                <td key={col.key} className="py-3 pr-4 font-plein text-sm text-text-secondary">
                  {col.cell ? col.cell(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [apiStats, setApiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [u, l, api] = await Promise.all([
          fetchUsers(),
          fetchLogs(),
          fetchApiStats(),
        ]);

        if (cancelled) return;

        setUsers(u || []);
        setLogs(l || []);
        setApiStats(api);
      } catch (err) {
        if (cancelled) return;
        console.error('DASHBOARD LOAD ERROR:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.is_active).length;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const logsThisMonth = logs.filter(
      (l) => new Date(l.created_at) >= monthStart
    ).length;

    return {
      total: users.length,
      active,
      logsThisMonth,
      apiToday: apiStats?.callsToday ?? 0,
    };
  }, [users, logs, apiStats]);

  const recentUsers = users.slice(0, 5);
  const recentLogs = logs.slice(0, 5);

  const userColumns = [
    { key: 'name', label: 'Name', cell: (r) => r.full_name || '—' },
    { key: 'email', label: 'Email', cell: (r) => r.email || '—' },
    {
      key: 'role',
      label: 'Role',
      cell: (r) => (
        <Badge className={ROLE_BADGE[r.role] || 'bg-wisteria-800 text-wisteria-300'}>
          {formatRole(r.role)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      cell: (r) => (
        <Badge className={r.is_active ? STATUS_BADGE.active : STATUS_BADGE.inactive}>
          {r.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'joined', label: 'Joined', cell: (r) => formatDate(r.created_at) },
  ];

  const logColumns = [
    { key: 'action', label: 'Action', cell: (r) => r.action || '—' },
    { key: 'user', label: 'Admin', cell: (r) => r.admin_name || r.admin_id || '—' },
    { key: 'time', label: 'Time', cell: (r) => formatDate(r.created_at) },
    {
      key: 'status',
      label: 'Status',
      cell: (r) => (
        <Badge className={ACTION_STATUS_BADGE[r.status] || 'bg-wisteria-800 text-wisteria-300'}>
          {r.status || 'success'}
        </Badge>
      ),
    },
  ];

  // ─── Loading ──────────────────────────────────────

  if (loading) {
    return (
      <div className="py-16 text-center font-plein text-base text-text-muted">
        Loading dashboard…
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────

  if (error) {
    return (
      <div className="rounded-[24px] bg-danger/10 border border-danger/30 p-6 text-center">
        <p className="font-plein-medium text-base text-danger mb-2">
          Could not load dashboard
        </p>
        <p className="font-plein text-sm text-text-secondary mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-danger px-5 py-2 font-plein-medium text-sm text-wisteria-50 hover:bg-danger/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Content ──────────────────────────────────────

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total}
          accent="bg-wisteria-300"
          iconBg="bg-wisteria-300/20"
          iconColor="text-wisteria-200"
          textColor="text-wisteria-300"
        />
        <StatCard
          icon={UserCheck}
          label="Active Users"
          value={stats.active}
          accent="bg-success"
          iconBg="bg-success/20"
          iconColor="text-success"
          textColor="text-success"
        />
        <StatCard
          icon={FileText}
          label="Logs This Month"
          value={stats.logsThisMonth}
          accent="bg-wisteria-200"
          iconBg="bg-wisteria-200/20"
          iconColor="text-wisteria-200"
          textColor="text-wisteria-200"
        />
        <StatCard
          icon={Globe}
          label="API Calls Today"
          value={stats.apiToday}
          accent="bg-warning"
          iconBg="bg-warning/20"
          iconColor="text-warning"
          textColor="text-warning"
        />
      </div>

      {/* Recent users */}
      <Section
        title="Recent Users"
        action={
          <Link
            to="/users"
            className="inline-flex items-center gap-1.5 font-plein-medium text-sm text-wisteria-300 hover:text-wisteria-200 transition-colors"
          >
            View all
            <ArrowRight size={14} />
          </Link>
        }
      >
        <SimpleTable
          columns={userColumns}
          rows={recentUsers}
          emptyMessage="No users yet."
        />
      </Section>

      {/* Recent logs */}
      <Section title="Recent System Logs">
        <SimpleTable
          columns={logColumns}
          rows={recentLogs}
          emptyMessage="No activity logged yet."
        />
      </Section>
    </div>
  );
}