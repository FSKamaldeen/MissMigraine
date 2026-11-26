import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { CYCLE_PHASE_META } from '../../constants/colors';

const ACCESS_LEVELS = {
  emergency_only: 1,
  limited: 2,
  full: 3,
};

function Section({ title, children }) {
  return (
    <View className="mb-6">
      <View className="mb-3 px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          {title}
        </Text>
      </View>
      <View className="mx-6 rounded-[24px] bg-surface p-5">{children}</View>
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View className="flex-1 items-center justify-center px-1">
      <Text className="font-reem text-3xl text-text-primary">{value}</Text>
      <Text className="mt-1 text-center font-plein text-sm text-text-muted">
        {label}
      </Text>
    </View>
  );
}

function InsightBox({ label, children }) {
  return (
    <View className="flex-1 rounded-2xl bg-elevated p-4">
      <Text className="mb-2 font-reem text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </Text>
      {children}
    </View>
  );
}

function AddPersonModal({ visible, onClose, onAdded }) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      Alert.alert('Missing code', 'Please enter an invitation code.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('add_trusted_connection', {
        input_code: normalized,
      });

      if (error || !data) {
        const msg = error?.message || 'Invalid or already-used code.';
        Alert.alert('Could not add', msg);
        return;
      }

      setCode('');
      onAdded();
    } catch (err) {
      console.error('ADD CONNECTION ERROR:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-background/80">
        <View className="rounded-t-3xl bg-surface px-6 pt-6 pb-10">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-reem text-2xl text-text-primary">
              Add another person
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={22} color="#f1ebf9" />
            </Pressable>
          </View>
          <Text className="mb-6 font-plein text-sm text-text-muted">
            Enter their invitation code to connect.
          </Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="MIG-XXXX-XXXX"
            placeholderTextColor="#c8b0e8"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!submitting}
            className="mb-6 h-[54px] rounded-full bg-elevated px-5 font-plein text-base tracking-widest text-text-primary"
          />

          <Pressable
            onPress={handleAdd}
            disabled={submitting}
            className={`items-center rounded-full py-4 ${
              submitting ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#11081b" />
            ) : (
              <Text className="font-plein-medium text-base text-text-inverse">
                Add person
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function getIntensityColor(value) {
  if (value <= 3) return '#6ca45b';
  if (value <= 6) return '#ffe162';
  return '#a01717';
}

function getTopN(items, n) {
  const counts = {};
  items.forEach((v) => {
    if (!v) return;
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

function formatDuration(hours) {
  if (hours == null) return '—';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours.toFixed(1)} hrs`;
}

// Month boundaries for trend comparison
function getMonthBounds(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

// Returns a trend glyph and color based on comparison
// direction: 'up' | 'down' | 'flat'
function getTrendIndicator(current, previous, higherIsWorse = true) {
  if (previous == null || current == null) {
    return { arrow: '', label: '', color: '#ad89dc' };
  }
  const diff = current - previous;
  const threshold = 0.2 * Math.max(Math.abs(previous), 0.5); // 20% relative or 0.1 absolute min
  if (Math.abs(diff) < threshold) {
    return { arrow: '→', label: 'steady', color: '#ad89dc' };
  }
  const isUp = diff > 0;
  // If higher is worse (frequency/intensity), up = bad
  const isBad = higherIsWorse ? isUp : !isUp;
  return {
    arrow: isUp ? '↑' : '↓',
    label: `${Math.abs(diff).toFixed(1)}`,
    color: isBad ? '#e07a5f' : '#6ca45b',
  };
}

export default function SharedDataScreen() {
  const [connections, setConnections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [cycleEntries, setCycleEntries] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_connected_main_users');
      if (error) throw error;

      const rows = Array.isArray(data) ? data : data ? [data] : [];
      setConnections(rows);

      if (rows.length > 0) {
        setSelectedId((prev) =>
          rows.some((r) => r.main_user_id === prev) ? prev : rows[0].main_user_id
        );
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      console.error('LOAD CONNECTIONS ERROR:', err);
      Alert.alert('Error', 'Could not load your connections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedId) {
      setLogs([]);
      setMedLogs([]);
      setCycleEntries([]);
      return;
    }

    async function loadData() {
      setDataLoading(true);
      try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const [logsRes, medLogsRes, cycleRes] = await Promise.all([
          supabase
            .from('migraine_logs')
            .select(`
              id, user_id, logged_at, start_time, end_time, intensity, duration_hours,
              migraine_log_symptoms ( symptom_id, symptoms ( name ) ),
              migraine_log_triggers ( trigger_id, triggers ( name ) )
            `)
            .eq('user_id', selectedId)
            .gte('logged_at', ninetyDaysAgo.toISOString())
            .order('logged_at', { ascending: false }),

          supabase
            .from('medication_logs')
            .select('id, user_id, medication_id, taken_at, effectiveness_rating, medications(name)')
            .eq('user_id', selectedId)
            .not('effectiveness_rating', 'is', null)
            .gte('taken_at', ninetyDaysAgo.toISOString()),

          supabase
            .from('cycle_entries')
            .select('id, user_id, period_start, period_end, cycle_length')
            .eq('user_id', selectedId)
            .order('period_start', { ascending: false })
            .limit(1),
        ]);

        if (logsRes.error) throw logsRes.error;
        if (medLogsRes.error) throw medLogsRes.error;
        if (cycleRes.error) throw cycleRes.error;

        if (!cancelled) {
          setLogs(logsRes.data || []);
          setMedLogs(medLogsRes.data || []);
          setCycleEntries(cycleRes.data || []);
        }
      } catch (err) {
        console.error('LOAD DATA ERROR:', err);
        if (!cancelled) {
          setLogs([]);
          setMedLogs([]);
          setCycleEntries([]);
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [selectedId]);

  const selected = useMemo(
    () => connections.find((c) => c.main_user_id === selectedId) || null,
    [connections, selectedId]
  );

  const accessLevel = ACCESS_LEVELS[selected?.access_level] ?? 1;

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
      ),
    [logs]
  );

  // Monthly summary

  const monthStats = useMemo(() => {
    const { start } = getMonthBounds(0);
    const monthLogs = sortedLogs.filter((log) => new Date(log.logged_at) >= start);

    const count = monthLogs.length;
    const avgIntensity = count
      ? (monthLogs.reduce((s, l) => s + l.intensity, 0) / count).toFixed(1)
      : '—';

    const durations = monthLogs
      .map((l) => l.duration_hours)
      .filter((h) => h != null);
    const avgDuration = durations.length
      ? (durations.reduce((s, h) => s + h, 0) / durations.length).toFixed(1)
      : '—';

    return { count, avgIntensity, avgDuration };
  }, [sortedLogs]);

  // Cycle data

  const cycleInfo = useMemo(() => {
    const entry = cycleEntries[0];
    if (!entry || !entry.period_start) return null;

    const start = new Date(entry.period_start);
    const cycleLength = entry.cycle_length || 28;
    const today = new Date();
    const daysSince = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((daysSince % cycleLength) + cycleLength) % cycleLength + 1;

    let phaseKey = 'luteal';
    if (dayInCycle <= 5) phaseKey = 'menstrual';
    else if (dayInCycle <= 13) phaseKey = 'follicular';
    else if (dayInCycle <= 16) phaseKey = 'ovulatory';
    else phaseKey = 'luteal';

    const daysUntilPeriod = cycleLength - dayInCycle + 1;

    return { phaseKey, dayInCycle, cycleLength, daysUntilPeriod };
  }, [cycleEntries]);

  // Insights

  const insights = useMemo(() => {
    const thisMonth = getMonthBounds(0);
    const lastMonth = getMonthBounds(-1);

    const logsInRange = (from, to) =>
      sortedLogs.filter((log) => {
        const d = new Date(log.logged_at);
        return d >= from && d < to;
      });

    const monthLogs = logsInRange(thisMonth.start, thisMonth.end);
    const lastMonthLogs = logsInRange(lastMonth.start, lastMonth.end);

    // Top symptoms / triggers for current month
    const allSymptoms = monthLogs.flatMap((l) =>
      (l.migraine_log_symptoms || [])
        .map((s) => s.symptoms?.name)
        .filter(Boolean)
    );
    const allTriggers = monthLogs.flatMap((l) =>
      (l.migraine_log_triggers || [])
        .map((t) => t.triggers?.name)
        .filter(Boolean)
    );

    const topSymptoms = getTopN(allSymptoms, 3);
    const topTriggers = getTopN(allTriggers, 3);

    // Cycle link
    let cycleLink = null;
    if (cycleInfo) {
      const phaseCounts = {};
      monthLogs.forEach((log) => {
        const phase = log.cycle_phase_key;
        if (phase) phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
      });
      const topPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0];
      if (topPhase) {
        const percent = Math.round((topPhase[1] / monthLogs.length) * 100);
        cycleLink = {
          phaseKey: topPhase[0],
          phaseName: CYCLE_PHASE_META[topPhase[0]]?.fullName || topPhase[0],
          percent,
        };
      }
    }

    // Top medication
    const medRatings = {};
    medLogs.forEach((ml) => {
      const name = ml.medications?.name;
      if (!name || ml.effectiveness_rating == null) return;
      if (!medRatings[name]) medRatings[name] = { sum: 0, count: 0 };
      medRatings[name].sum += ml.effectiveness_rating;
      medRatings[name].count += 1;
    });
    const topMedEntry = Object.entries(medRatings)
      .map(([name, { sum, count }]) => ({ name, avg: sum / count, count }))
      .sort((a, b) => b.avg - a.avg)[0];

    // Frequency trend 
    const freqCurrent = monthLogs.length;
    const freqPrevious = lastMonthLogs.length;
    const freqTrend = getTrendIndicator(freqCurrent, freqPrevious, true);

    // Severity trend
    const sevCurrent = monthLogs.length
      ? monthLogs.reduce((s, l) => s + l.intensity, 0) / monthLogs.length
      : null;
    const sevPrevious = lastMonthLogs.length
      ? lastMonthLogs.reduce((s, l) => s + l.intensity, 0) / lastMonthLogs.length
      : null;
    const sevTrend = getTrendIndicator(sevCurrent, sevPrevious, true);

    const currentMonthDayOfMonth = new Date().getDate();
    const hasHalfMonth = currentMonthDayOfMonth >= 15;
    const canShowTrend = hasHalfMonth || freqCurrent >= 2;

    return {
      topSymptoms,
      topTriggers,
      cycleLink,
      topMed: topMedEntry || null,
      frequency: {
        current: freqCurrent,
        previous: freqPrevious,
        trend: freqTrend,
        showComparison: canShowTrend && freqPrevious > 0,
      },
      severity: {
        current: sevCurrent != null ? sevCurrent.toFixed(1) : '—',
        previous: sevPrevious != null ? sevPrevious.toFixed(1) : null,
        trend: sevTrend,
        showComparison: canShowTrend && sevPrevious != null,
      },
    };
  }, [sortedLogs, medLogs, cycleInfo]);

  const selectedName =
    selected?.preferred_name || selected?.full_name || 'Select a person';

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#ad89dc" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-8 pb-6">
          <Text
            className="font-reem text-4xl text-text-primary"
            style={{ lineHeight: 48 }}
          >
            Shared data
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            {selected
              ? "Everything they've chosen to share with you."
              : 'Your connections will appear here.'}
          </Text>
        </View>

        <View className="mb-6 px-6">
          <Pressable
            onPress={() => setDropdownOpen((v) => !v)}
            className="flex-row items-center justify-between rounded-[24px] bg-surface p-5 active:opacity-80"
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-brand/20">
                <MaterialCommunityIcons name="account" size={24} color="#ad89dc" />
              </View>
              <View className="flex-1">
                <Text
                  className="font-plein-medium text-lg text-text-primary"
                  numberOfLines={1}
                >
                  {selected ? selectedName : 'No one connected'}
                </Text>
                <Text className="font-plein text-sm text-text-muted mt-0.5">
                  {connections.length === 0
                    ? 'Add a person to get started'
                    : connections.length === 1
                    ? '1 connected'
                    : `${connections.length} connected`}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#ad89dc"
            />
          </Pressable>

          {dropdownOpen && (
            <View className="mt-2 rounded-[24px] bg-surface overflow-hidden">
              {connections.map((person, idx) => {
                const isActive = person.main_user_id === selectedId;
                return (
                  <Pressable
                    key={person.main_user_id}
                    onPress={() => {
                      setSelectedId(person.main_user_id);
                      setDropdownOpen(false);
                    }}
                    className={`flex-row items-center gap-3 px-5 py-4 active:opacity-70 ${
                      idx > 0 ? 'border-t border-elevated' : ''
                    }`}
                  >
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-full ${
                        isActive ? 'bg-brand' : 'bg-elevated'
                      }`}
                    >
                      <Text
                        className={`font-plein-medium text-sm ${
                          isActive ? 'text-text-inverse' : 'text-text-secondary'
                        }`}
                      >
                        {(person.preferred_name || person.full_name || '?')
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      className={`flex-1 font-plein-medium text-base ${
                        isActive ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                      numberOfLines={1}
                    >
                      {person.preferred_name || person.full_name || 'Unnamed'}
                    </Text>
                    {isActive && (
                      <MaterialCommunityIcons name="check" size={18} color="#ad89dc" />
                    )}
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => {
                  setDropdownOpen(false);
                  setAddModalOpen(true);
                }}
                className={`flex-row items-center gap-3 px-5 py-4 active:opacity-70 ${
                  connections.length > 0 ? 'border-t border-elevated' : ''
                }`}
              >
                <View className="h-9 w-9 items-center justify-center rounded-full bg-brand/20">
                  <MaterialCommunityIcons name="plus" size={20} color="#ad89dc" />
                </View>
                <Text className="flex-1 font-plein-medium text-base text-brand-light">
                  Add another user
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {selected && (
          <>
            {dataLoading ? (
              <View className="py-12 items-center">
                <ActivityIndicator color="#ad89dc" />
              </View>
            ) : (
              <>
                <Section title="This month's summary">
                  <View className="flex-row items-center">
                    <Stat value={monthStats.count} label="Migraines" />
                    <View className="w-[2px] h-10 bg-elevated" />
                    <Stat value={monthStats.avgIntensity} label="Avg intensity" />
                    <View className="w-[2px] h-10 bg-elevated" />
                    <Stat
                      value={
                        monthStats.avgDuration === '—'
                          ? '—'
                          : `${monthStats.avgDuration}h`
                      }
                      label="Avg duration"
                    />
                  </View>
                </Section>

                {accessLevel >= 3 && (
                  <Section title="Current cycle">
                    {cycleInfo ? (
                      <View>
                        <Text
                          className="font-reem text-2xl mb-1"
                          style={{ color: CYCLE_PHASE_META[cycleInfo.phaseKey]?.color }}
                        >
                          {CYCLE_PHASE_META[cycleInfo.phaseKey]?.fullName}
                        </Text>
                        <Text className="font-plein-medium text-base text-text-secondary mb-4">
                          Day {cycleInfo.dayInCycle} of {cycleInfo.cycleLength}
                        </Text>

                        <View className="h-3 flex-row overflow-hidden rounded-full bg-elevated mb-2">
                          <View style={{ flex: 5, backgroundColor: CYCLE_PHASE_META.menstrual.color }} />
                          <View style={{ flex: 8, backgroundColor: CYCLE_PHASE_META.follicular.color }} />
                          <View style={{ flex: 4, backgroundColor: CYCLE_PHASE_META.ovulatory.color }} />
                          <View style={{ flex: Math.max(cycleInfo.cycleLength - 17, 1), backgroundColor: CYCLE_PHASE_META.luteal.color }} />
                        </View>

                        <View className="flex-row justify-between mt-2 px-1">
                          <Text className="font-plein text-xs text-text-muted">Start</Text>
                          <Text className="font-plein text-xs text-text-muted">
                            Next period in {cycleInfo.daysUntilPeriod} days
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text className="py-2 font-plein text-base text-text-muted">
                        No cycle data
                      </Text>
                    )}
                  </Section>
                )}

                {accessLevel >= 2 && (
                  <Section title="Insights">
                    <View className="gap-3">
                      <View className="flex-row gap-3">
                        <InsightBox label="Top symptoms">
                          {insights.topSymptoms.length === 0 ? (
                            <Text className="font-plein text-sm text-text-muted">—</Text>
                          ) : (
                            insights.topSymptoms.map((s) => (
                              <Text key={s.name} className="font-plein text-sm text-text-primary mb-1">
                                {s.name}
                              </Text>
                            ))
                          )}
                        </InsightBox>

                        <InsightBox label="Top triggers">
                          {insights.topTriggers.length === 0 ? (
                            <Text className="font-plein text-sm text-text-muted">—</Text>
                          ) : (
                            insights.topTriggers.map((t) => (
                              <Text key={t.name} className="font-plein text-sm text-text-primary mb-1">
                                {t.name}
                              </Text>
                            ))
                          )}
                        </InsightBox>
                      </View>

                      <View className="flex-row gap-3">
                        <InsightBox label="Cycle link">
                          {insights.cycleLink ? (
                            <>
                              <Text className="font-plein text-sm text-text-primary">
                                {insights.cycleLink.phaseName}
                              </Text>
                              <Text className="font-plein text-xs text-text-muted mt-1">
                                {insights.cycleLink.percent}% of logs
                              </Text>
                            </>
                          ) : (
                            <Text className="font-plein text-sm text-text-muted">
                              Not enough data
                            </Text>
                          )}
                        </InsightBox>

                        <InsightBox label="Top medication">
                          {insights.topMed ? (
                            <>
                              <Text className="font-plein text-sm text-text-primary">
                                {insights.topMed.name}
                              </Text>
                              <Text className="font-plein text-xs text-text-muted mt-1">
                                {insights.topMed.avg.toFixed(1)}/5 avg
                              </Text>
                            </>
                          ) : (
                            <Text className="font-plein text-sm text-text-muted">—</Text>
                          )}
                        </InsightBox>
                      </View>

                      <View className="flex-row gap-3">
                        <InsightBox label="Frequency">
                          <Text className="font-plein text-sm text-text-primary">
                            {insights.frequency.current} this month
                          </Text>
                          {insights.frequency.showComparison ? (
                            <Text
                              className="font-plein text-xs mt-1"
                              style={{ color: insights.frequency.trend.color }}
                            >
                              {insights.frequency.trend.arrow}{' '}
                              {insights.frequency.trend.label} vs last month
                            </Text>
                          ) : (
                            <Text className="font-plein text-xs text-text-muted mt-1">
                              {insights.frequency.previous > 0
                                ? `${insights.frequency.previous} last month`
                                : 'No comparison yet'}
                            </Text>
                          )}
                        </InsightBox>

                        <InsightBox label="Severity">
                          <Text className="font-plein text-sm text-text-primary">
                            {insights.severity.current !== '—'
                              ? `${insights.severity.current}/10 avg`
                              : '—'}
                          </Text>
                          {insights.severity.showComparison ? (
                            <Text
                              className="font-plein text-xs mt-1"
                              style={{ color: insights.severity.trend.color }}
                            >
                              {insights.severity.trend.arrow}{' '}
                              {insights.severity.trend.label} vs last month
                            </Text>
                          ) : (
                            <Text className="font-plein text-xs text-text-muted mt-1">
                              {insights.severity.previous
                                ? `${insights.severity.previous}/10 last month`
                                : 'No comparison yet'}
                            </Text>
                          )}
                        </InsightBox>
                      </View>
                    </View>
                  </Section>
                )}

                <Section title="Recent logs">
                  {sortedLogs.length === 0 ? (
                    <Text className="py-2 font-plein text-base text-text-muted">
                      No migraines logged yet.
                    </Text>
                  ) : (
                    sortedLogs.slice(0, 5).map((log, idx) => {
                      const logDate = new Date(log.logged_at);
                      const timeStr = logDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      });
                      const dateStr = logDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                      const duration = log.duration_hours;

                      const bg = getIntensityColor(log.intensity);
                      const isDark = log.intensity >= 7;

                      return (
                        <View
                          key={log.id}
                          className={`py-4 ${idx > 0 ? 'border-t border-elevated' : ''}`}
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="font-plein-medium text-base text-text-primary">
                              {dateStr} at {timeStr}
                            </Text>
                            <View
                              className="px-2.5 py-1 rounded-full"
                              style={{ backgroundColor: bg }}
                            >
                              <Text
                                className={`font-plein-medium text-xs ${
                                  isDark ? 'text-text-primary' : 'text-text-inverse'
                                }`}
                              >
                                Intensity {log.intensity}/10
                              </Text>
                            </View>
                          </View>
                          <Text className="font-plein text-sm text-text-muted">
                            Duration: {formatDuration(duration)}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </Section>
              </>
            )}
          </>
        )}

        {!selected && (
          <View className="mx-6 rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={40}
              color="#472376"
            />
            <Text className="mt-3 text-center font-plein-medium text-base text-text-primary">
              No one connected yet
            </Text>
            <Text className="mt-1 text-center font-plein text-sm text-text-muted">
              Tap above to add someone using their invitation code.
            </Text>
          </View>
        )}
      </ScrollView>

      <AddPersonModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdded={async () => {
          setAddModalOpen(false);
          await loadConnections();
          Alert.alert('Connected', 'The person has been added.');
        }}
      />
    </SafeAreaView>
  );
}