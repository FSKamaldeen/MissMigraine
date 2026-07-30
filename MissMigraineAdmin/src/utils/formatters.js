export function roleBadgeVariant(role) {
  if (role === 'admin') return 'maroon';
  if (role === 'trusted_person') return 'accent';
  return 'neutral';
}

export function formatRole(role) {
  if (role === 'trusted_person') return 'Trusted Person';
  if (role === 'admin') return 'Admin';
  return 'User';
}

export function statusBadgeVariant(status) {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  return 'danger';
}

export function formatStatus(status, isActive) {
  if (status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  return isActive ? 'Active' : 'Inactive';
}

export function formatCategory(cat) {
  return cat
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
