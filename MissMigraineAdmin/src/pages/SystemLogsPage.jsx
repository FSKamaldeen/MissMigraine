import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { ConfirmModal } from '../components/ui/Modal';
import { SortableTable, Pagination, paginate } from '../components/ui/SortableTable';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../utils/formatters';
import { clearLogs, exportToCsv, fetchLogs } from '../services/api';

const PER_PAGE = 10;
const ACTION_TYPES = [
  'All',
  'Login',
  'Logout',
  'Delete User',
  'Disable User',
  'Enable User',
  'Edit Content',
  'Publish Content',
  'Unpublish Content',
  'Update Settings',
  'Export Logs',
  'Create User',
  'Edit User',
];

export function SystemLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = useCallback(async () => {
    setLogs(await fetchLogs());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== 'All' && log.action !== actionFilter) return false;
      const t = new Date(log.created_at);
      if (fromDate && t < new Date(fromDate)) return false;
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (t > end) return false;
      }
      return true;
    });
  }, [logs, actionFilter, fromDate, toDate]);

  const { items, totalPages, page: safePage } = paginate(filtered, page, PER_PAGE);

  useEffect(() => setPage(1), [actionFilter, fromDate, toDate]);

  function handleExport(format) {
    const columns = [
      { label: 'Timestamp', accessor: (r) => r.created_at },
      { label: 'Admin', accessor: (r) => r.admin_name || r.admin_id },
      { label: 'Action', accessor: (r) => r.action },
      { label: 'Target User', accessor: (r) => r.target_user_name || r.target_user_id },
      { label: 'Details', accessor: (r) => JSON.stringify(r.details) },
      { label: 'Status', accessor: (r) => r.status },
    ];
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'system-logs.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      exportToCsv(filtered, columns, 'system-logs.csv');
    }
    showToast('Logs exported');
  }

  async function handleClear() {
    await clearLogs();
    showToast('All logs cleared', 'warning');
    load();
  }

  const columns = [
    {
      key: 'time',
      label: 'Timestamp',
      sortValue: (r) => r.created_at,
      cell: (r) => formatDateTime(r.created_at),
    },
    {
      key: 'admin',
      label: 'Admin',
      sortValue: (r) => r.admin_name,
      cell: (r) => r.admin_name || r.admin_id,
    },
    { key: 'action', label: 'Action', sortValue: (r) => r.action, cell: (r) => r.action },
    {
      key: 'target',
      label: 'Target User',
      sortValue: (r) => r.target_user_name,
      cell: (r) => r.target_user_name || '—',
    },
    {
      key: 'details',
      label: 'Details',
      sortable: false,
      cell: (r) => (
        <code className="json-preview">
          {JSON.stringify(r.details)?.slice(0, 80)}
          {(JSON.stringify(r.details)?.length || 0) > 80 ? '…' : ''}
        </code>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge variant={r.status === 'failed' ? 'danger' : 'success'}>
          {r.status || 'success'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="System Logs"
        subtitle="Monitor system activity and errors"
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => handleExport('csv')}>
              Export CSV
            </button>
            <button type="button" className="btn btn--primary" onClick={() => handleExport('json')}>
              Export Logs
            </button>
            <button type="button" className="btn btn--danger" onClick={() => setConfirmClear(true)}>
              Clear Logs
            </button>
          </>
        }
      />

      <div className="toolbar card">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="All">All Actions</option>
          {ACTION_TYPES.filter((a) => a !== 'All').map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <label className="field field--inline">
          <span className="field__label">From</span>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </label>
        <label className="field field--inline">
          <span className="field__label">To</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </label>
      </div>

      <div className="card section">
        <SortableTable columns={columns} rows={items} emptyMessage="No logs match your filters" />
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear all logs"
        message="This will permanently remove all system log entries. Continue?"
        confirmLabel="Clear Logs"
        danger
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClear}
      />
    </div>
  );
}
