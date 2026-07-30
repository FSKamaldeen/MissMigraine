import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { SortableTable, Pagination, paginate } from '../components/ui/SortableTable';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';
import {
  formatDate,
  formatRole,
  formatStatus,
  roleBadgeVariant,
  statusBadgeVariant,
} from '../utils/formatters';
import {
  createUser,
  deleteUser,
  fetchUsers,
  setUserActive,
  updateUser,
} from '../services/api';

const PER_PAGE = 8;
const ROLES = ['user', 'trusted_person', 'admin'];
const STATUSES = ['active', 'inactive', 'suspended'];

const emptyForm = {
  full_name: '',
  email: '',
  role: 'user',
  status: 'active',
};

export function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    const data = await fetchUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      const st = u.status || (u.is_active ? 'active' : 'inactive');
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (!q) return true;
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter, statusFilter]);

  const { items, totalPages, page: safePage } = paginate(filtered, page, PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  function openAdd() {
    setEditUser(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(user) {
    setEditUser(user);
    setForm({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status || (user.is_active ? 'active' : 'inactive'),
    });
    setFormOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      ...form,
      is_active: form.status === 'active',
    };
    if (editUser) {
      await updateUser(editUser.id, payload);
      showToast('User updated successfully');
    } else {
      await createUser(payload);
      showToast('User created successfully');
    }
    setFormOpen(false);
    load();
  }

  async function toggleActive(user) {
    const st = user.status || (user.is_active ? 'active' : 'inactive');
    const next = st !== 'active';
    await setUserActive(user.id, next);
    showToast(next ? 'User enabled' : 'User disabled');
    load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.id);
    showToast('User deleted', 'warning');
    setDeleteTarget(null);
    load();
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortValue: (r) => r.full_name,
      cell: (r) => (
        <button type="button" className="link-btn" onClick={() => setDetailUser(r)}>
          {r.full_name}
        </button>
      ),
    },
    { key: 'email', label: 'Email', sortValue: (r) => r.email, cell: (r) => r.email },
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
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      cell: (r) => {
        const active = (r.status || (r.is_active ? 'active' : 'inactive')) === 'active';
        return (
          <div className="table-actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(r)}>
              Edit
            </button>
            <button
              type="button"
              className={`btn btn--sm ${active ? 'btn--warning' : 'btn--success'}`}
              onClick={() => toggleActive(r)}
              disabled={r.role === 'admin'}
            >
              {active ? 'Disable' : 'Enable'}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => setDeleteTarget(r)}
              disabled={r.role === 'admin'}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="User Management"
        subtitle="View and manage all registered users"
        actions={
          <button type="button" className="btn btn--primary" onClick={openAdd}>
            Add User
          </button>
        }
      />

      <div className="toolbar card">
        <input
          type="search"
          className="search-input"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="trusted_person">Trusted Person</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="card section">
        <SortableTable columns={columns} rows={items} />
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        open={formOpen}
        title={editUser ? 'Edit User' : 'Add User'}
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSave} className="stack-form">
          <label className="field">
            <span className="field__label">Full name</span>
            <input
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="field">
            <span className="field__label">Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {formatRole(r)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
          </label>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailUser} title="User Details" onClose={() => setDetailUser(null)}>
        {detailUser && (
          <dl className="detail-list">
            <dt>Name</dt>
            <dd>{detailUser.full_name}</dd>
            <dt>Email</dt>
            <dd>{detailUser.email}</dd>
            <dt>Role</dt>
            <dd>{formatRole(detailUser.role)}</dd>
            <dt>Status</dt>
            <dd>{formatStatus(detailUser.status, detailUser.is_active)}</dd>
            <dt>Joined</dt>
            <dd>{formatDate(detailUser.created_at)}</dd>
            <dt>User ID</dt>
            <dd>{detailUser.id}</dd>
          </dl>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete user"
        message={`Are you sure you want to delete ${deleteTarget?.full_name}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
