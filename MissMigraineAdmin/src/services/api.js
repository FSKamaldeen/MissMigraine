import { supabase } from '../lib/supabase';

function assertClient() {
  if (!supabase) {
    throw new Error('Supabase client is not initialized. Check your .env file.');
  }
}

// ─────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────

export async function fetchUsers() {
  assertClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, role, is_active, created_at, last_login')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function setUserActive(userId, isActive) {
  assertClient();
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId);
    if (error) throw error;
    await logAdminAction(isActive ? 'Enable User' : 'Disable User', userId, { status: 'success' });
    return true;
  } catch (err) {
    await logAdminAction(isActive ? 'Enable User' : 'Disable User', userId, {
      status: 'failed',
      error: err.message,
    });
    throw err;
  }
}

export async function deleteUser(userId) {
  assertClient();
  try {
    const { data, error } = await supabase.functions.invoke('admin-delete-user', { body: { userId } });
    if (error) {
      // Read the real error from the response body
      const body = error.context ? await error.context.text() : 'Unknown error';
      throw new Error(`Delete failed: ${body}`);
    }
    if (data?.error) throw new Error(data.error);
    await logAdminAction('Delete User', null, {
      status: 'success',
      deleted_user_id: userId,
    });
    return true;
  } catch (err) {
    await logAdminAction('Delete User', null, {
      status: 'failed',
      error: err.message,
      attempted_user_id: userId,
    });
    throw err;
  }
}

// ─────────────────────────────────────────────────────
// System Logs
// ─────────────────────────────────────────────────────

export async function fetchLogs() {
  assertClient();
  const { data, error } = await supabase
    .from('system_logs')
    .select('id, admin_id, action, target_user_id, details, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw error;

  const adminIds = [...new Set((data || []).map((r) => r.admin_id).filter(Boolean))];
  const targetIds = [...new Set((data || []).map((r) => r.target_user_id).filter(Boolean))];
  const allIds = [...new Set([...adminIds, ...targetIds])];

  let nameMap = {};
  if (allIds.length > 0) {
    const { data: names } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', allIds);
    nameMap = Object.fromEntries(
      (names || []).map((n) => [n.id, n.full_name || n.email || n.id])
    );
  }

  return (data || []).map((log) => ({
    ...log,
    admin_name: nameMap[log.admin_id] || null,
    target_user_name: nameMap[log.target_user_id] || null,
    status: log.details?.status || 'success',
  }));
}

export async function logAdminAction(action, targetUserId = null, details = {}) {
  assertClient();
  
  // Get the current admin's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return; // Silently fail if not logged in (shouldn't happen)

  const { error } = await supabase.from('system_logs').insert({
    admin_id: user.id,
    action: action,
    target_user_id: targetUserId,
    details: details,
  });

  if (error) {
    console.error('Failed to write audit log:', error);
    // Don't throw — logging failure shouldn't block the main action
  }
}

// ─────────────────────────────────────────────────────
// API stats
// ─────────────────────────────────────────────────────

export async function fetchApiStats() {
  assertClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { count: callsToday },
    { count: callsThisMonth },
    { data: weekRows, error: weekError },
  ] = await Promise.all([
    supabase
      .from('weather_cache')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'api')
      .gte('cached_at', startOfDay.toISOString()),
    supabase
      .from('weather_cache')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'api')
      .gte('cached_at', startOfMonth.toISOString()),
    supabase
      .from('weather_cache')
      .select('cached_at')
      .eq('source', 'api')
      .gte('cached_at', sevenDaysAgo.toISOString()),
  ]);

  if (weekError) throw weekError;

  // Bucket the last 7 days into daily counts
  const dayBuckets = Array(7).fill(0);
  (weekRows || []).forEach((row) => {
    const d = new Date(row.cached_at);
    const dayDiff = Math.floor((d - sevenDaysAgo) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) dayBuckets[dayDiff] += 1;
  });

  // Rate limit heuristic based on today's call count
  const today = callsToday ?? 0;
  let rateLimitStatus = 'healthy';
  if (today > 750) rateLimitStatus = 'critical';
  else if (today > 500) rateLimitStatus = 'warning';

  return {
    callsToday: today,
    callsThisMonth: callsThisMonth ?? 0,
    rateLimitStatus,
    dailyCalls: dayBuckets,
  };
}

// ─────────────────────────────────────────────────────
// Educational Content
// ─────────────────────────────────────────────────────

export async function fetchContent() {
  assertClient();
  const { data, error } = await supabase
    .from('educational_content')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    ...item,
    body: item.content,
    featured_image_url: item.featured_image,
  }));
}

export async function saveContent(item) {
  assertClient();

  try {
    const payload = {
      title: item.title,
      category: item.category,
      content: item.body,
      featured_image: item.featured_image_url || null,
      is_published: item.is_published,
      created_by: item.created_by || null,
    };

    let result, actionName;

    if (item.id) {
      const { data, error } = await supabase
        .from('educational_content')
        .update(payload)
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
      actionName = item.is_published ? 'Publish Content' : 'Unpublish Content';
    } else {
      const { data, error } = await supabase.from('educational_content').insert(payload).select().single();
      if (error) throw error;
      result = data;
      actionName = 'Publish Content';
    }
      await logAdminAction(actionName, null, { status: 'success', content_id: result.id, title: item.title });
      return result;
    } catch (err) {
    await logAdminAction(item.id ? 'Edit Content' : 'Publish Content', null, {
      status: 'failed',
      error: err.message,
      title: item.title,
    });
    throw err;
  }
}


export async function deleteContent(id) {
  assertClient();
  try {
    const { error } = await supabase.from('educational_content').delete().eq('id', id);
    if (error) throw error;
    await logAdminAction('Delete Content', null, 
      { status: 'success', content_id: id });
    return true;
  } catch (err) {
    await logAdminAction('Delete Content', null, 
      { status: 'failed', error: err.message, content_id: id });
    throw err;
  }
}

// ─────────────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────────────

const SETTINGS_ROW_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_SETTINGS = {
  default_log_reminder_time: '20:00',
  default_cycle_reminder_days_before: 2,
  emergency_alert_threshold: 7,
  otp_expiry_minutes: 60,
  data_retention_days: 365,
  max_quick_logs_per_day: 5,
  max_offline_logs: 50,
  allow_data_export: true,
  allow_account_deletion: true,
  app_maintenance_mode: false,
  min_android_version: '10',
  insight_generation_frequency: 'daily',
};

export async function fetchSettings() {
  assertClient();
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();

  if (error) throw error;

  // If the row doesn't exist yet, return safe defaults so the page still loads
  if (!data) {
    return { ...DEFAULT_SETTINGS, _exists: false };
  }

  return {
    ...data,
    _exists: true,
    default_log_reminder_time: data.default_reminder_logging_time ?? DEFAULT_SETTINGS.default_log_reminder_time,
    default_cycle_reminder_days_before: data.default_cycle_reminder ?? DEFAULT_SETTINGS.default_cycle_reminder_days_before,
    otp_expiry_minutes: data.otp_expiry ?? DEFAULT_SETTINGS.otp_expiry_minutes,
  };
}

export async function saveSettings(settings) {
  assertClient();
  try {
    const { _exists, ...cleanSettings } = settings;
    const payload = {
      id: SETTINGS_ROW_ID,
      default_reminder_logging_time: cleanSettings.default_log_reminder_time,
      default_cycle_reminder: cleanSettings.default_cycle_reminder_days_before,
      emergency_alert_threshold: cleanSettings.emergency_alert_threshold,
      otp_expiry: cleanSettings.otp_expiry_minutes,
      data_retention_days: cleanSettings.data_retention_days,
      max_quick_logs_per_day: cleanSettings.max_quick_logs_per_day,
      max_offline_logs: cleanSettings.max_offline_logs,
      allow_data_export: cleanSettings.allow_data_export,
      allow_account_deletion: cleanSettings.allow_account_deletion,
      app_maintenance_mode: cleanSettings.app_maintenance_mode,
      min_android_version: cleanSettings.min_android_version,
      insight_generation_frequency: cleanSettings.insight_generation_frequency,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('system_settings').upsert(payload, { onConflict: 'id' }).select().single();
    if (error) throw error;
    await logAdminAction('Update Settings', null, { status: 'success' });
    return data;
  } catch (err) {
    await logAdminAction('Update Settings', null, { status: 'failed', error: err.message });
    throw err;
  }
}

// ─────────────────────────────────────────────────────
// Export Reports
// ─────────────────────────────────────────────────────

export function exportToCsv(rows, columns, filename) {
  const header = columns.map((c) => `"${c.label}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = c.accessor(row);
          const str = val == null ? '' : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function logExport(format) {
  assertClient();
  await logAdminAction('Export Logs', null, {
    status: 'success',
    format,
    count: 0,
  });
}