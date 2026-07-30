import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { createMockStore, MOCK_ADMIN } from '../data/mockData';

let mockStore = createMockStore();

function isMockMode() {
  return !isSupabaseConfigured;
}

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signIn(email, password) {
  if (isMockMode()) {
    await delay();
    if (
      email === MOCK_ADMIN.email &&
      password === MOCK_ADMIN.password
    ) {
      return { user: MOCK_ADMIN.profile, error: null };
    }
    return { user: null, error: { message: 'Invalid email or password' } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { user: null, error };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    await supabase.auth.signOut();
    return {
      user: null,
      error: { message: 'Access denied. Admin role required.' },
    };
  }
  return { user: profile, error: null };
}

export async function signOut() {
  if (isMockMode()) return;
  await supabase.auth.signOut();
}

export async function getSessionUser() {
  if (isMockMode()) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'admin') return null;
  return profile;
}

export async function fetchUsers() {
  if (isMockMode()) {
    await delay();
    return [...mockStore.users];
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createUser(payload) {
  if (isMockMode()) {
    await delay();
    const user = {
      id: `user-${Date.now()}`,
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role || 'user',
      status: payload.status || 'active',
      is_active: payload.status !== 'inactive' && payload.status !== 'suspended',
      created_at: new Date().toISOString(),
    };
    mockStore.users.unshift(user);
    appendLog('Create User', user.id, user.full_name);
    return user;
  }
  const { data, error } = await supabase.from('profiles').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateUser(id, updates) {
  if (isMockMode()) {
    await delay();
    mockStore.users = mockStore.users.map((u) =>
      u.id === id ? { ...u, ...updates } : u,
    );
    return mockStore.users.find((u) => u.id === id);
  }
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id) {
  if (isMockMode()) {
    await delay();
    const user = mockStore.users.find((u) => u.id === id);
    mockStore.users = mockStore.users.filter((u) => u.id !== id);
    appendLog('Delete User', id, user?.full_name);
    return true;
  }
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function setUserActive(id, active) {
  const status = active ? 'active' : 'inactive';
  const action = active ? 'Enable User' : 'Disable User';
  if (isMockMode()) {
    await delay();
    mockStore.users = mockStore.users.map((u) =>
      u.id === id ? { ...u, is_active: active, status } : u,
    );
    const user = mockStore.users.find((u) => u.id === id);
    appendLog(action, id, user?.full_name);
    return user;
  }
  return updateUser(id, { is_active: active, status });
}

function appendLog(action, targetUserId, targetName) {
  mockStore.logs.unshift({
    id: `log-${Date.now()}`,
    created_at: new Date().toISOString(),
    admin_id: MOCK_ADMIN.profile.id,
    admin_name: MOCK_ADMIN.profile.full_name,
    action,
    target_user_id: targetUserId,
    target_user_name: targetName || '—',
    details: { source: 'admin_panel' },
    status: 'success',
  });
}

export async function fetchLogs() {
  if (isMockMode()) {
    await delay();
    return [...mockStore.logs];
  }
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function clearLogs() {
  if (isMockMode()) {
    await delay();
    mockStore.logs = [];
    return true;
  }
  const { error } = await supabase.from('system_logs').delete().neq('id', '');
  if (error) throw error;
  return true;
}

export async function fetchContent() {
  if (isMockMode()) {
    await delay();
    return [...mockStore.content];
  }
  const { data, error } = await supabase
    .from('educational_content')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveContent(item) {
  if (isMockMode()) {
    await delay();
    if (item.id) {
      mockStore.content = mockStore.content.map((c) =>
        c.id === item.id ? { ...c, ...item } : c,
      );
      appendLog('Edit Content', null, item.title);
      return mockStore.content.find((c) => c.id === item.id);
    }
    const created = {
      ...item,
      id: `content-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    mockStore.content.unshift(created);
    appendLog('Edit Content', null, created.title);
    return created;
  }
  if (item.id) {
    const { data, error } = await supabase
      .from('educational_content')
      .update(item)
      .eq('id', item.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('educational_content')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContent(id) {
  if (isMockMode()) {
    await delay();
    mockStore.content = mockStore.content.filter((c) => c.id !== id);
    return true;
  }
  const { error } = await supabase.from('educational_content').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function fetchSettings() {
  if (isMockMode()) {
    await delay();
    return { ...mockStore.settings };
  }
  const { data, error } = await supabase.from('system_settings').select('*').single();
  if (error) throw error;
  return data;
}

export async function saveSettings(settings) {
  if (isMockMode()) {
    await delay();
    mockStore.settings = { ...mockStore.settings, ...settings };
    appendLog('Update Settings', null, 'System');
    return mockStore.settings;
  }
  const { data, error } = await supabase
    .from('system_settings')
    .upsert(settings)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchApiStats() {
  if (isMockMode()) {
    await delay(80);
    return { ...mockStore.apiStats };
  }
  const { data, error } = await supabase.from('api_usage').select('*').single();
  if (error) return createMockStore().apiStats;
  return data;
}

export function exportToCsv(rows, columns, filename) {
  const header = columns.map((c) => c.label).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const val = c.accessor(row);
        const str = val == null ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(','),
  );
  const blob = new Blob([[header, ...lines].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function isUsingMockData() {
  return isMockMode();
}
