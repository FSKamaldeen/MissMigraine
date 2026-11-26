import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileJson,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { ConfirmModal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { formatDateTime } from '../utils/formatters';
import { logExport, exportToCsv, fetchLogs } from '../services/api';

const PER_PAGE = 10;
const ACTION_TYPES = [
  'All',
  'Login',
  'Logout',
  'Delete User',
  'Delete Content',
  'Edit Content',
  'Publish Content',
  'Unpublish Content',
  'Update Settings',
  'Export Logs',
];

// ─────────────────────────────────────────────────────
// Badge color map
// ─────────────────────────────────────────────────────

const LOG_STATUS_BADGE = {
  success: 'bg-success/25 text-wisteria-50 border border-success/50',
  failed: 'bg-danger/25 text-wisteria-50 border border-danger/50',
  warning: 'bg-warning/20 text-wisteria-950 border border-warning/40',
};

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export function SystemLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLogs((await fetchLogs()) || []);
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const items = filtered.slice(start, start + PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, fromDate, toDate]);

  // ─── Handlers ──────────────────────────────────────

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

  // System log
  await logExport(format);
  showToast('Logs exported');
  }

  // ─── Render ────────────────────────────────────────

  return (
    <div>
      {/* Toolbar */}
      <div className="rounded-[24px] bg-surface border border-border p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        
        {/* Action filter */}
        <div className="relative flex-1 min-w-[180px]">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full h-11 appearance-none rounded-xl bg-elevated pl-4 pr-10 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
          >
            <option value="All">All Actions</option>
            {ACTION_TYPES.filter((a) => a !== 'All').map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        {/* From date */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-plein-medium text-xs uppercase tracking-wider text-text-muted pointer-events-none">
            From
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-11 rounded-xl bg-elevated pl-16 pr-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
          />
        </div>

        {/* To date */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-plein-medium text-xs uppercase tracking-wider text-text-muted pointer-events-none">
            To
          </span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-11 rounded-xl bg-elevated pl-12 pr-4 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
          />
        </div>

        {/* Export CSV */}
        <button
          onClick={() => handleExport('csv')}
          className="h-11 rounded-xl bg-elevated px-4 font-plein-medium text-sm text-text-secondary hover:bg-wisteria-500 hover:text-wisteria-50 transition-colors inline-flex items-center gap-2 shrink-0"
        >
          <Download size={16} />
          CSV
        </button>

        {/* Export JSON */}
        <button
          onClick={() => handleExport('json')}
          className="h-11 rounded-xl bg-wisteria-300 px-5 font-plein-medium text-sm text-wisteria-950 hover:bg-wisteria-200 transition-colors inline-flex items-center gap-2 shrink-0 shadow-md shadow-wisteria-900/20"
        >
          <FileJson size={16} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="rounded-[24px] bg-wisteria-800 border border-wisteria-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-wisteria-700 bg-wisteria-900/50">
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Timestamp</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Admin</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Action</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Target</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Details</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center font-plein text-sm text-wisteria-300">
                    No logs match your filters.
                  </td>
                </tr>
              ) : (
                items.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-wisteria-700/50 last:border-b-0 hover:bg-wisteria-700/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-plein text-sm text-wisteria-200 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-6 py-4 font-plein text-sm text-wisteria-100">
                      {log.admin_name || log.admin_id || '—'}
                    </td>
                    <td className="px-6 py-4 font-plein-medium text-sm text-wisteria-50">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 font-plein text-sm text-wisteria-200">
                      {log.target_user_name || '—'}
                    </td>
                    <td className="px-6 py-4 max-w-[240px]">
                      <code className="font-plein text-xs text-wisteria-300 break-all">
                        {JSON.stringify(log.details)?.slice(0, 60)}
                        {(JSON.stringify(log.details)?.length || 0) > 60 ? '…' : ''}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={LOG_STATUS_BADGE[log.status] || LOG_STATUS_BADGE.success}>
                        {log.status || 'success'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-wisteria-700 bg-wisteria-900/30">
            <p className="font-plein text-sm text-wisteria-300">
              Showing {start + 1}–{Math.min(start + PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-elevated text-text-secondary hover:bg-wisteria-300 hover:text-wisteria-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 font-plein-medium text-sm text-text-primary">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-elevated text-text-secondary hover:bg-wisteria-300 hover:text-wisteria-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}