import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader, StatCard } from '../components/ui/PageHeader';
import { SortableTable } from '../components/ui/SortableTable';
import { Badge } from '../components/ui/Badge';
import {
  formatDate,
  formatRole,
  formatStatus,
  roleBadgeVariant,
  statusBadgeVariant,
} from '../utils/formatters';
import { fetchApiStats, fetchLogs, fetchUsers } from '../services/api';

export function DashboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [apiStats, setApiStats] = useState(null);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchLogs(), fetchApiStats()]).then(([u, l, api]) => {
      setUsers(u);
      setLogs(l);
      setApiStats(api);
    });
  }, []);

  const stats = useMemo(() => {
    const active = users.filter((u) => u.status === 'active' || u.is_active).length;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const logsThisMonth = logs.filter((l) => new Date(l.created_at) >= monthStart).length;
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
    {
      key: 'name',
      label: 'Name',
      sortValue: (r) => r.full_name,
      cell: (r) => r.full_name,
    },
    {
      key: 'email',
      label: 'Email',
      sortValue: (r) => r.email,
      cell: (r) => r.email,
    },
    {
      key: 'role',
      label: 'Role',
      sortValue: (r) => r.role,
      cell: (r) => <Badge variant={roleBadgeVariant(r.role)}>{formatRole(r.role)}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      sortValue: (r) => r.status || (r.is_active ? 'active' : 'inactive'),
      cell: (r) => (
        <Badge variant={statusBadgeVariant(r.status || (r.is_active ? 'active' : 'inactive'))}>
          {formatStatus(r.status, r.is_active)}
        </Badge>
      ),
    },
    {
      key: 'joined',
      label: 'Joined Date',
      sortValue: (r) => r.created_at,
      cell: (r) => formatDate(r.created_at),
    },
  ];

  const logColumns = [
    {
      key: 'action',
      label: 'Action',
      sortValue: (r) => r.action,
      cell: (r) => r.action,
    },
    {
      key: 'user',
      label: 'User',
      sortValue: (r) => r.admin_name || r.admin_id,
      cell: (r) => r.admin_name || r.admin_id,
    },
    {
      key: 'time',
      label: 'Time',
      sortValue: (r) => r.created_at,
      cell: (r) => formatDate(r.created_at),
    },
    {
      key: 'status',
      label: 'Status',
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge variant={r.status === 'success' ? 'success' : 'danger'}>{r.status || 'success'}</Badge>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="Dashboard" subtitle="Overview of your system" />

      <div className="stat-grid">
        <StatCard icon="👥" label="Total Users" value={stats.total} />
        <StatCard icon="🟢" label="Active Users" value={stats.active} />
        <StatCard icon="📝" label="Logs This Month" value={stats.logsThisMonth} />
        <StatCard icon="🌐" label="API Calls Today" value={stats.apiToday} />
      </div>

      <section className="card section">
        <h2 className="section-title">Recent Users</h2>
        <SortableTable columns={userColumns} rows={recentUsers} />
        <div className="section-footer">
          <Link to="/users" className="btn btn--primary">
            View All Users
          </Link>
        </div>
      </section>

      <section className="card section">
        <h2 className="section-title">Recent System Logs</h2>
        <SortableTable columns={logColumns} rows={recentLogs} />
      </section>

      <section className="quick-actions">
        <button type="button" className="card quick-action" onClick={() => navigate('/content')}>
          <span className="quick-action__title">Add Educational Content</span>
          <span className="quick-action__desc">Create a new article or guide</span>
        </button>
        <button type="button" className="card quick-action" onClick={() => navigate('/logs')}>
          <span className="quick-action__title">Export System Logs</span>
          <span className="quick-action__desc">Download activity as CSV</span>
        </button>
        <button type="button" className="card quick-action" onClick={() => navigate('/settings')}>
          <span className="quick-action__title">Configure Settings</span>
          <span className="quick-action__desc">Update global defaults</span>
        </button>
      </section>
    </div>
  );
}
