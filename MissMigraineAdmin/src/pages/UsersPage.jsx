import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Power,
  Trash2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { deleteUser, fetchUsers, setUserActive } from '../services/api';
import { ConfirmModal } from '../components/ui/Modal';

const PER_PAGE = 8;

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

const ROLE_BADGE = {
  admin: 'bg-wisteria-200 text-wisteria-950',
  user: 'bg-wisteria-500/25 text-wisteria-200',
  trusted_person: 'bg-wisteria-400 text-wisteria-950',
};

const STATUS_BADGE = {
  active: 'bg-success/25 text-wisteria-50 border border-success/50',
  inactive: 'bg-wisteria-800 text-wisteria-100 border border-wisteria-600',
};

function Badge({ children, className }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 font-plein-medium text-xs ${className}`}>
      {children}
    </span>
  );
}

export function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailUser, setDetailUser] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('FETCH USERS ERROR:', err);
      showToast('Failed to load users', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      const st = u.is_active ? 'active' : 'inactive';
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (!q) return true;
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const items = filtered.slice(start, start + PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  async function toggleActive(user) {
    try {
      await setUserActive(user.id, !user.is_active);
      showToast(user.is_active ? 'User disabled' : 'User enabled', 'success');
      load();
    } catch (err) {
      console.error('TOGGLE USER ERROR:', err);
      showToast('Failed to update user status', 'error');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      showToast('User and all related data deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      console.error('DELETE USER ERROR:', err);
      showToast('Failed to delete user', 'error');
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="rounded-[24px] bg-surface border border-border p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl bg-elevated pl-11 pr-4 font-plein text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 w-full md:w-auto appearance-none rounded-xl bg-elevated pl-4 pr-10 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="trusted_person">Trusted Person</option>
            <option value="admin">Admin</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 w-full md:w-auto appearance-none rounded-xl bg-elevated pl-4 pr-10 font-plein text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[24px] bg-wisteria-700 border border-wisteria-600 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-wisteria-600 bg-wisteria-800/60">
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Name</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Email</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Role</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Status</th>
                <th className="px-6 py-4 text-left font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Joined</th>
                <th className="px-6 py-4 text-right font-plein-medium text-xs uppercase tracking-wider text-wisteria-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center font-plein text-sm text-wisteria-300">
                    No users found.
                  </td>
                </tr>
              ) : (
                items.map((u) => {
                  const active = u.is_active;
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-wisteria-600/50 last:border-b-0 hover:bg-wisteria-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-plein-medium text-sm text-wisteria-50">
                        <button
                          onClick={() => setDetailUser(u)}
                          className="hover:text-cycle-luteal transition-colors"
                        >
                          {u.full_name || '—'}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-plein text-sm text-wisteria-200">
                        {u.email || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={ROLE_BADGE[u.role] || 'bg-wisteria-900 text-wisteria-300'}>
                          {formatRole(u.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={active ? STATUS_BADGE.active : STATUS_BADGE.inactive}>
                          {active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-plein text-sm text-wisteria-200">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          {/* Active Status Change */}
                          <button
                            onClick={() => toggleActive(u)}
                            disabled={isAdmin}
                            title={active ? 'Disable' : 'Enable'}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                              isAdmin
                                ? 'bg-wisteria-900 text-wisteria-600 cursor-not-allowed'
                                : active
                                ? 'bg-warning/20 text-warning hover:bg-warning hover:text-background'
                                : 'bg-success/20 text-success hover:bg-success hover:text-background'
                            }`}
                          >
                            <Power size={14} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={isAdmin}
                            title="Delete"
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                              isAdmin
                                ? 'bg-wisteria-900 text-wisteria-600 cursor-not-allowed'
                                : 'bg-danger/20 text-danger hover:bg-danger hover:text-wisteria-50'
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-wisteria-600 bg-wisteria-800/40">
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

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete user"
        message={`Are you sure you want to delete ${deleteTarget?.full_name || deleteTarget?.email}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      {/* Detail modal */}
      {detailUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setDetailUser(null)}
        >
          <div
            className="w-full max-w-md rounded-[24px] bg-wisteria-700 border border-wisteria-600 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-reem text-xl text-wisteria-50">User Details</h2>
              <button
                onClick={() => setDetailUser(null)}
                className="text-wisteria-300 hover:text-wisteria-50"
              >
                ✕
              </button>
            </div>
            <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-3">
              <dt className="font-plein text-sm text-wisteria-300">Name</dt>
              <dd className="font-plein-medium text-sm text-wisteria-50">{detailUser.full_name || '—'}</dd>
              <dt className="font-plein text-sm text-wisteria-300">Email</dt>
              <dd className="font-plein text-sm text-wisteria-50">{detailUser.email}</dd>
              <dt className="font-plein text-sm text-wisteria-300">Role</dt>
              <dd>
                <Badge className={ROLE_BADGE[detailUser.role] || 'bg-wisteria-900 text-wisteria-300'}>
                  {formatRole(detailUser.role)}
                </Badge>
              </dd>
              <dt className="font-plein text-sm text-wisteria-300">Status</dt>
              <dd>
                <Badge className={detailUser.is_active ? STATUS_BADGE.active : STATUS_BADGE.inactive}>
                  {detailUser.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
              <dt className="font-plein text-sm text-wisteria-300">Joined</dt>
              <dd className="font-plein text-sm text-wisteria-50">{formatDate(detailUser.created_at)}</dd>
              <dt className="font-plein text-sm text-wisteria-300">Last Login</dt>
              <dd className="font-plein text-sm text-wisteria-50">{formatDate(detailUser.last_login)}</dd>
              <dt className="font-plein text-sm text-wisteria-300">User ID</dt>
              <dd className="font-plein text-xs text-wisteria-300 break-all">{detailUser.id}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}