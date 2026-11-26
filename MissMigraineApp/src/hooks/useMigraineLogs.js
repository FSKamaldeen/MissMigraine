import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toDateInputValue, isBetween } from '../utils/dateUtils';

// ─────────────────────────────────────────────────────
// Resolvers — names → UUIDs (create if missing)
// ─────────────────────────────────────────────────────

async function resolveSymptomIds(symptomNames, userId) {
  if (!symptomNames || symptomNames.length === 0) return [];
  const cleaned = symptomNames.map((n) => String(n).trim()).filter(Boolean);
  if (cleaned.length === 0) return [];

  const { data: existing } = await supabase
    .from('symptoms').select('id, name').eq('user_id', userId);

  const nameToId = new Map((existing || []).map((s) => [s.name.toLowerCase(), s.id]));
  const resolved = [];
  const toCreate = [];

  for (const name of cleaned) {
    const key = name.toLowerCase();
    if (nameToId.has(key)) resolved.push(nameToId.get(key));
    else toCreate.push(name);
  }

  if (toCreate.length > 0) {
    const { data: created } = await supabase
      .from('symptoms')
      .insert(toCreate.map((name) => ({ user_id: userId, name, is_custom: true })))
      .select('id, name');
    (created || []).forEach((s) => resolved.push(s.id));
  }
  return resolved;
}

async function resolveTriggerIds(triggerNames, userId) {
  if (!triggerNames || triggerNames.length === 0) return [];
  const cleaned = triggerNames.map((n) => String(n).trim()).filter(Boolean);
  if (cleaned.length === 0) return [];

  const { data: existing } = await supabase
    .from('triggers').select('id, name').eq('user_id', userId);

  const nameToId = new Map((existing || []).map((t) => [t.name.toLowerCase(), t.id]));
  const resolved = [];
  const toCreate = [];

  for (const name of cleaned) {
    const key = name.toLowerCase();
    if (nameToId.has(key)) resolved.push(nameToId.get(key));
    else toCreate.push(name);
  }

  if (toCreate.length > 0) {
    const { data: created } = await supabase
      .from('triggers')
      .insert(toCreate.map((name) => ({
        user_id: userId, name, category: 'other', is_custom: true,
      })))
      .select('id, name');
    (created || []).forEach((t) => resolved.push(t.id));
  }
  return resolved;
}

async function resolveMedicationIds(medicationNames, userId) {
  if (!medicationNames || medicationNames.length === 0) return [];
  const cleaned = medicationNames.map((n) => String(n).trim()).filter(Boolean);
  if (cleaned.length === 0) return [];

  const { data: existing } = await supabase
    .from('medications').select('id, name').eq('user_id', userId);

  const nameToId = new Map((existing || []).map((m) => [m.name.toLowerCase(), m.id]));

  return cleaned
    .map((name) => nameToId.get(name.toLowerCase()))
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────
// Row mapping
// ─────────────────────────────────────────────────────

function dbRowToLog(row, symptoms, triggers, medications) {
  return {
    id: row.id,
    dateTime: row.logged_at || row.start_time,
    startDateTime: row.start_time,
    endDateTime: row.end_time,
    stillOngoing: !row.end_time,
    durationHours: row.duration_hours,
    intensity: row.intensity,
    symptoms: symptoms || [],
    triggers: triggers || [],
    medications: medications || [],
    hasAura: row.aura_present,
    auraPresent: row.aura_present,
    auraDescription: row.aura_description || '',
    cyclePhaseKey: row.cycle_phase,
    cycleDay: row.cycle_day,
    notes: row.notes || '',
    weather: { temp: row.weather_temp, pressure: row.weather_pressure },
  };
}

// logToDbRow now includes the resolved UUID arrays
function logToDbRow(log, userId, ids = {}) {
  return {
    user_id: userId,
    logged_at: log.dateTime || log.startDateTime,
    start_time: log.startDateTime || log.dateTime,
    end_time: log.endDateTime || null,
    intensity: log.intensity,
    duration_hours: log.durationHours || null,
    aura_present: log.auraPresent || log.hasAura || false,
    aura_description: log.auraDescription || null,
    symptom_ids: ids.symptomIds || [],
    trigger_ids: ids.triggerIds || [],
    medication_ids: ids.medicationIds || [],
    cycle_phase: log.cyclePhaseKey || null,
    cycle_day: log.cycleDay || null,
    notes: log.notes || null,
    weather_temp: log.weather?.temp || null,
    weather_pressure: log.weather?.pressure || null,
  };
}

// ─────────────────────────────────────────────────────
// Junction writes (idempotent — clears + re-inserts)
// ─────────────────────────────────────────────────────

async function writeJunctions(migraineLogId, userId, log, ids) {
  // Clear existing
  await Promise.all([
    supabase.from('migraine_log_symptoms').delete().eq('migraine_log_id', migraineLogId),
    supabase.from('migraine_log_triggers').delete().eq('migraine_log_id', migraineLogId),
    supabase.from('migraine_log_medications').delete().eq('migraine_log_id', migraineLogId),
    supabase.from('medication_logs').delete().eq('migraine_log_id', migraineLogId),
  ]);

  // Symptoms
  if (ids.symptomIds?.length > 0) {
    await supabase.from('migraine_log_symptoms').insert(
      ids.symptomIds.map((sid) => ({ migraine_log_id: migraineLogId, symptom_id: sid }))
    );
  }

  // Triggers
  if (ids.triggerIds?.length > 0) {
    await supabase.from('migraine_log_triggers').insert(
      ids.triggerIds.map((tid) => ({ migraine_log_id: migraineLogId, trigger_id: tid }))
    );
  }

  // Medications → both the new junction table AND medication_logs
  if (ids.medicationIds?.length > 0) {
    await supabase.from('migraine_log_medications').insert(
      ids.medicationIds.map((mid) => ({ migraine_log_id: migraineLogId, medication_id: mid }))
    );
    await supabase.from('medication_logs').insert(
      ids.medicationIds.map((mid) => ({
        user_id: userId,
        medication_id: mid,
        migraine_log_id: migraineLogId,
        taken_at: log.dateTime || log.startDateTime,
      }))
    );
  }
}

// ─────────────────────────────────────────────────────
// Read helpers
// ─────────────────────────────────────────────────────

async function loadJunctionsForLogs(logIds) {
  if (logIds.length === 0) {
    return { symptomsByLog: {}, triggersByLog: {}, medsByLog: {} };
  }

  const [symRes, trigRes, medRes] = await Promise.all([
    supabase.from('migraine_log_symptoms')
      .select('migraine_log_id, symptoms(name)').in('migraine_log_id', logIds),
    supabase.from('migraine_log_triggers')
      .select('migraine_log_id, triggers(name)').in('migraine_log_id', logIds),
    supabase.from('migraine_log_medications')
      .select('migraine_log_id, medications(name)').in('migraine_log_id', logIds),
  ]);

  const symptomsByLog = {};
  (symRes.data || []).forEach((r) => {
    if (!r.symptoms?.name) return;
    (symptomsByLog[r.migraine_log_id] ||= []).push(r.symptoms.name);
  });

  const triggersByLog = {};
  (trigRes.data || []).forEach((r) => {
    if (!r.triggers?.name) return;
    (triggersByLog[r.migraine_log_id] ||= []).push(r.triggers.name);
  });

  const medsByLog = {};
  (medRes.data || []).forEach((r) => {
    if (!r.medications?.name) return;
    (medsByLog[r.migraine_log_id] ||= []).push(r.medications.name);
  });

  return { symptomsByLog, triggersByLog, medsByLog };
}

// ─────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────

export function useMigraineLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLogs([]); return; }

      const { data, error: fetchError } = await supabase
        .from('migraine_logs').select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      if (fetchError) throw fetchError;

      const rows = data || [];
      const { symptomsByLog, triggersByLog, medsByLog } =
        await loadJunctionsForLogs(rows.map((r) => r.id));

      const mapped = rows.map((row) =>
        dbRowToLog(row, symptomsByLog[row.id], triggersByLog[row.id], medsByLog[row.id])
      );

      setLogs(mapped);
      setError(null);
    } catch (err) {
      console.log('Error fetching migraine logs:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const addLog = useCallback(async (log) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Resolve all names → UUIDs first
      const [symptomIds, triggerIds, medicationIds] = await Promise.all([
        resolveSymptomIds(log.symptoms, user.id),
        resolveTriggerIds(log.triggers, user.id),
        resolveMedicationIds(log.medications, user.id),
      ]);

      const { data, error: insertError } = await supabase
        .from('migraine_logs')
        .insert(logToDbRow(log, user.id, { symptomIds, triggerIds, medicationIds }))
        .select().single();

      if (insertError) throw insertError;

      await writeJunctions(data.id, user.id, log, { symptomIds, triggerIds, medicationIds });

      await fetchLogs();
      return { success: true, id: data.id };
    } catch (err) {
      console.log('Error adding log:', err);
      return { success: false, error: err };
    }
  }, [fetchLogs]);

  const updateLog = useCallback(async (id, patch) => {
    try {
      const existing = logs.find((l) => l.id === id);
      if (!existing) return { success: false };

      const merged = { ...existing, ...patch };
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      const [symptomIds, triggerIds, medicationIds] = await Promise.all([
        resolveSymptomIds(merged.symptoms, user.id),
        resolveTriggerIds(merged.triggers, user.id),
        resolveMedicationIds(merged.medications, user.id),
      ]);

      const { error: updateError } = await supabase
        .from('migraine_logs')
        .update(logToDbRow(merged, user.id, { symptomIds, triggerIds, medicationIds }))
        .eq('id', id);

      if (updateError) throw updateError;

      await writeJunctions(id, user.id, merged, { symptomIds, triggerIds, medicationIds });

      await fetchLogs();
      return { success: true };
    } catch (err) {
      console.log('Error updating log:', err);
      return { success: false, error: err };
    }
  }, [logs, fetchLogs]);

  const deleteLog = useCallback(async (id) => {
    try {
      const { error: deleteError } = await supabase
        .from('migraine_logs').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setLogs((prev) => prev.filter((log) => log.id !== id));
      return { success: true };
    } catch (err) {
      console.log('Error deleting log:', err);
      return { success: false, error: err };
    }
  }, []);

  const getLogsByDate = useCallback(
    (dateKey) => logs.filter((log) => toDateInputValue(new Date(log.dateTime)) === dateKey),
    [logs]
  );
  const getLogsForMonth = useCallback(
    (monthDate) => logs.filter((log) => {
      const d = new Date(log.dateTime);
      return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
    }),
    [logs]
  );
  const getLogsInRange = useCallback(
    (start, end) => logs.filter((log) => isBetween(new Date(log.dateTime), start, end)),
    [logs]
  );

  const logsByDate = useMemo(
    () => logs.reduce((acc, log) => {
      const key = toDateInputValue(new Date(log.dateTime));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    [logs]
  );

  const getMonthlyStats = useCallback(
    (monthDate = new Date()) => {
      const monthLogs = getLogsForMonth(monthDate);
      const count = monthLogs.length;
      const avgIntensity = count
        ? (monthLogs.reduce((sum, l) => sum + l.intensity, 0) / count).toFixed(1)
        : '0.0';
      const avgDuration = count
        ? (monthLogs.reduce((sum, l) => sum + (l.durationHours || 0), 0) / count).toFixed(1)
        : '0.0';
      return { count, avgIntensity, avgDuration };
    },
    [getLogsForMonth]
  );

  const monthlyStats = useMemo(() => getMonthlyStats(new Date()), [getMonthlyStats]);

  return {
    logs, loading, error, refetch: fetchLogs,
    addLog, updateLog, deleteLog,
    getLogsByDate, getLogsForMonth, getLogsInRange,
    logsByDate, monthlyStats, getMonthlyStats,
  };
}