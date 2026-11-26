import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Image,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTipForLog } from '../../constants/migraineData';
import { supabase } from '../../lib/supabase';

// ─────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

function GreetingHeader({ name = 'there' }) {
  return (
    <View
      className="mx-6 mt-6 mb-8 h-44 rounded-[28px] bg-wisteria-300 overflow-hidden flex-row"
      style={{
        shadowColor: '#11081b',
        shadowOpacity: 0.4,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      <View className="flex-1 justify-center pl-6 pr-4 z-10">
        <Text className="font-reem text-3xl text-text-inverse mb-1">
          {getGreeting()}
        </Text>
        <Text
          className="font-reem text-5xl text-text-primary"
          style={{ lineHeight: 60 }}
        >
          {name}
        </Text>
      </View>

      <View className="absolute bottom-0 right-0 w-48 h-48 justify-end items-end">
        <Image
          source={require('../../assets/images/normal.png')}
          style={{ width: 200, height: 200, marginBottom: -50, marginRight: -54 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function getIntensityColor(value) {
  if (value <= 3) return '#6ca45b';
  if (value <= 6) return '#ffe162';
  return '#a01717';
}

function OngoingCard({ log, onOpen }) {
  const start = new Date(log.logged_at);
  const timeString = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateString = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const color = getIntensityColor(log.intensity);
  const elapsedHrs = ((Date.now() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);

  return (
    <Pressable
      onPress={onOpen}
      className="mx-6 mb-4 rounded-[24px] bg-surface overflow-hidden active:opacity-80"
    >
      <View className="flex-row">
        <View style={{ width: 10, backgroundColor: color }} />

        <View className="flex-1 p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
              Ongoing Migraine
            </Text>
            <Text
              className="font-plein-medium text-sm"
              style={{ color }}
            >
              {log.intensity}/10
            </Text>
          </View>

          <Text className="font-plein-medium text-base text-text-primary mb-3">
            Ongoing for {elapsedHrs} hours
          </Text>

          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color="#c8b0e8"
            />
            <Text className="font-plein text-sm text-text-muted">
              Started {dateString} at {timeString}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ hasConnections, muted }) {
  if (!hasConnections) {
    return (
      <View className="mx-6 rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
        <MaterialCommunityIcons
          name="account-off-outline"
          size={40}
          color="#472376"
        />
        <Text className="mt-3 text-center font-plein-medium text-base text-text-primary">
          No one connected
        </Text>
        <Text className="mt-1 text-center font-plein text-sm text-text-muted">
          You're not currently linked to a main user. Ask them for an invitation code.
        </Text>
      </View>
    );
  }

  if (muted) {
    return (
      <View className="mx-6 rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
        <MaterialCommunityIcons
          name="bell-off-outline"
          size={40}
          color="#472376"
        />
        <Text className="mt-3 text-center font-plein-medium text-base text-text-primary">
          Notifications are off
        </Text>
        <Text className="mt-1 text-center font-plein text-sm text-text-muted">
          You've turned off ongoing migraine alerts. You can re-enable them in Notifications settings.
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-6 rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-8 items-center mt-4">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand/10 mb-4">
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color="#ad89dc"
        />
      </View>
      <Text className="text-center font-plein-medium text-base text-text-primary mb-2">
        All clear
      </Text>
      <Text className="text-center font-plein text-sm text-text-muted leading-6">
        No ongoing migraines right now. We'll show you here if someone needs attention.
      </Text>
    </View>
  );
}

function HelpModal({ visible, log, mainUserName, onClose }) {
  if (!log) return null;

  const tip = getTipForLog(log);
  const triggers = (log.migraine_log_triggers || [])
    .map((t) => t.triggers?.name)
    .filter(Boolean);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-background/80">
        <View className="rounded-t-3xl bg-surface px-6 pt-6 pb-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-reem text-2xl text-text-primary">
              How you can help
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={22} color="#f1ebf9" />
            </Pressable>
          </View>

          <Text className="mb-4 font-plein text-base leading-7 text-text-secondary">
            {tip.cause}
          </Text>

          {triggers.length > 0 && (
            <Text className="mb-6 font-plein text-sm text-text-muted">
              Triggers logged: {triggers.join(', ')}
            </Text>
          )}

          <View className="mb-6 border-t border-elevated pt-5">
            <Text className="mb-2 font-plein-medium text-xs uppercase tracking-wider text-brand-light">
              What might help
            </Text>
            <Text className="font-plein text-base leading-7 text-text-primary">
              {tip.tip}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            className="items-center rounded-full bg-brand py-4 active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-base text-text-inverse">
              Got it
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────
// Settings helpers
// ─────────────────────────────────────────────────────

function isWithinDnd(settings) {
  if (!settings?.dnd_enabled) return false;
  if (!settings.dnd_start || !settings.dnd_end) return false;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = settings.dnd_start.split(':').map(Number);
  const [endH, endM] = settings.dnd_end.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  if (startMin <= endMin) {
    return nowMinutes >= startMin && nowMinutes < endMin;
  }
  return nowMinutes >= startMin || nowMinutes < endMin;
}

function shouldShowLog(log, settings) {
  if (!settings) return true;
  if (!settings.master_enabled) return false;
  if (!settings.severe_alerts) return false;

  if (isWithinDnd(settings) && !settings.allow_severe_during_dnd) {
    return false;
  }

  const threshold = settings.severe_threshold ?? 6;
  return log.intensity >= threshold;
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function TrustedHomeScreen({ navigation }) {
  const [selfName, setSelfName] = useState('there');
  const [connections, setConnections] = useState([]);
  const [logsByUser, setLogsByUser] = useState({});
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [helpLog, setHelpLog] = useState(null);
  const [helpMainName, setHelpMainName] = useState('');

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [selfUserRes, connRes, settingsRes] = await Promise.all([
        supabase
          .from('users')
          .select('preferred_name')
          .eq('id', user.id)
          .maybeSingle(),
        supabase.rpc('get_connected_main_users'),
        supabase
          .from('trusted_notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (connRes.error) throw connRes.error;
      if (settingsRes.error) throw settingsRes.error;

      const connectionRows = Array.isArray(connRes.data)
        ? connRes.data
        : connRes.data
        ? [connRes.data]
        : [];

      setSelfName(selfUserRes.data?.preferred_name || 'there');
      setConnections(connectionRows);
      setSettings(settingsRes.data || null);

      if (connectionRows.length === 0) {
        setLogsByUser({});
        return;
      }

      const userIds = connectionRows.map((c) => c.main_user_id);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logRows, error: logsError } = await supabase
        .from('migraine_logs')
        .select(`
          id, user_id, logged_at, start_time, end_time, intensity, notes,
          migraine_log_triggers ( trigger_id, triggers ( name ) )
        `)
        .in('user_id', userIds)
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: false });

      if (logsError) throw logsError;

      const grouped = {};
      userIds.forEach((id) => { grouped[id] = []; });
      (logRows || []).forEach((log) => {
        if (!log.end_time) {
          grouped[log.user_id].push(log);
        }
      });
      Object.keys(grouped).forEach((id) => {
        grouped[id].sort(
          (a, b) => new Date(b.logged_at) - new Date(a.logged_at)
        );
      });

      setLogsByUser(grouped);
    } catch (err) {
      console.error('TRUSTED HOME LOAD ERROR:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      await load();
      if (!cancelled) setLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, [load]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // Build filtered per-person blocks based on settings
  const activeBlocks = useMemo(() => {
    return connections
      .map((conn) => {
        const ongoing = (logsByUser[conn.main_user_id] || []).filter((log) =>
          shouldShowLog(log, settings)
        );
        return {
          connection: conn,
          ongoing,
          name: conn.preferred_name || conn.full_name || 'Your person',
        };
      })
      .filter((block) => block.ongoing.length > 0);
  }, [connections, logsByUser, settings]);

  const handleOpenHelp = (log, mainName) => {
    setHelpLog(log);
    setHelpMainName(mainName);
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#ad89dc" />
      </SafeAreaView>
    );
  }

  const hasAnyOngoing = activeBlocks.length > 0;

  let mutedReason = false;
  if (settings) {
    if (!settings.master_enabled || !settings.severe_alerts) {
      mutedReason = true;
    } else if (isWithinDnd(settings) && !settings.allow_severe_during_dnd) {
      mutedReason = true;
    }
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ad89dc"
            colors={['#ad89dc']}
          />
        }
      >
        <GreetingHeader name={selfName} />

        {hasAnyOngoing ? (
          activeBlocks.map((block) => (
            <View key={block.connection.main_user_id} className="mb-4">
              <View className="mb-3 px-6">
                <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
                  {block.name}
                </Text>
              </View>
              {block.ongoing.map((log) => (
                <OngoingCard
                  key={log.id}
                  log={log}
                  mainUserName={block.name}
                  onOpen={() => handleOpenHelp(log, block.name)}
                />
              ))}
            </View>
          ))
        ) : (
          <EmptyState
            hasConnections={connections.length > 0}
            muted={mutedReason}
          />
        )}
      </ScrollView>

      <HelpModal
        visible={!!helpLog}
        log={helpLog}
        mainUserName={helpMainName}
        onClose={() => setHelpLog(null)}
      />
    </SafeAreaView>
  );
}