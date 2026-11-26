import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

const DEFAULT_SETTINGS = {
  master_enabled: true,
  severe_alerts: true,
  severe_threshold: 6,
  moderate_alerts: false,
  weekly_digest: true,
  weekly_digest_day: 'Monday',
  dnd_enabled: false,
  dnd_start: '22:00',
  dnd_end: '07:00',
  allow_severe_during_dnd: true,
};

// Three tiers only. The stored value is the intensity threshold.
const SEVERITY_TIERS = [
  { value: 3, label: 'Mild', range: '3+' },
  { value: 6, label: 'Moderate', range: '6+' },
  { value: 8, label: 'Severe', range: '8+' },
];

function to12Hour(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function Section({ title, children }) {
  return (
    <View className="mb-6">
      {title && (
        <View className="mb-3 px-6">
          <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
            {title}
          </Text>
        </View>
      )}
      <View className="mx-6 rounded-[24px] bg-surface overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="mx-5 h-[1px] bg-elevated" />;
}

function ToggleRow({ label, subtitle, value, onChange, disabled = false }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onChange}
      disabled={disabled}
      className={`flex-row items-center justify-between px-5 py-4 ${
        disabled ? 'opacity-40' : 'active:opacity-70'
      }`}
    >
      <View className="flex-1 pr-4">
        <Text className="font-plein-medium text-base text-text-primary">
          {label}
        </Text>
        {subtitle && (
          <Text className="mt-1 font-plein text-sm leading-5 text-text-muted">
            {subtitle}
          </Text>
        )}
      </View>

      <View
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: value ? '#ad89dc' : '#2f174f',
          position: 'relative',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#f1ebf9',
            top: 4,
            left: value ? 24 : 4,
          }}
        />
      </View>
    </Pressable>
  );
}

function ChoiceRow({ label, options, value, onChange, disabled = false }) {
  return (
    <View className={`px-5 py-4 ${disabled ? 'opacity-40' : ''}`}>
      <Text className="mb-3 font-plein-medium text-sm text-text-secondary">
        {label}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const isActive = value === optionValue;

          return (
            <Pressable
              key={optionValue}
              onPress={disabled ? undefined : () => onChange(optionValue)}
              className={`rounded-full px-4 py-2.5 active:opacity-70 ${
                isActive ? 'bg-brand' : 'bg-elevated'
              }`}
            >
              <Text
                className={`font-plein-medium text-sm ${
                  isActive ? 'text-text-inverse' : 'text-text-secondary'
                }`}
              >
                {optionLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Three-tier severity selector
function SeverityRow({ value, onChange, disabled }) {
  return (
    <View className={`px-5 py-4 ${disabled ? 'opacity-40' : ''}`}>
      <Text className="mb-3 font-plein-medium text-sm text-text-secondary">
        Alert me when intensity is at least
      </Text>

      <View className="flex-row gap-2">
        {SEVERITY_TIERS.map((tier) => {
          const isActive = value === tier.value;
          return (
            <Pressable
              key={tier.value}
              onPress={disabled ? undefined : () => onChange(tier.value)}
              className={`flex-1 items-center justify-center rounded-xl py-3 active:opacity-70 ${
                isActive ? 'bg-brand' : 'bg-elevated'
              }`}
            >
              <Text
                className={`font-plein-medium text-sm ${
                  isActive ? 'text-text-inverse' : 'text-text-secondary'
                }`}
              >
                {tier.label}
              </Text>
              <Text
                className={`mt-0.5 font-plein text-xs ${
                  isActive ? 'text-text-inverse/70' : 'text-text-muted'
                }`}
              >
                {tier.range}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TrustedNotificationsScreen({ navigation }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'You are not signed in.');
          return;
        }

        const { data: existing, error: fetchError } = await supabase
          .from('trusted_notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
          if (!cancelled) setSettings(existing);
        } else {
          const { data: created, error: createError } = await supabase
            .from('trusted_notification_settings')
            .insert({ user_id: user.id, ...DEFAULT_SETTINGS })
            .select()
            .single();

          if (createError) throw createError;
          if (!cancelled) setSettings(created);
        }
      } catch (err) {
        console.error('NOTIFICATION SETTINGS LOAD ERROR:', err);
        Alert.alert('Error', 'Could not load your notification settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const masterOn = settings?.master_enabled ?? false;

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setChoice = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You are not signed in.');
        return;
      }

      const { error } = await supabase
        .from('trusted_notification_settings')
        .update({
          master_enabled: settings.master_enabled,
          severe_alerts: settings.severe_alerts,
          severe_threshold: settings.severe_threshold,
          moderate_alerts: settings.moderate_alerts,
          weekly_digest: settings.weekly_digest,
          weekly_digest_day: settings.weekly_digest_day,
          dnd_enabled: settings.dnd_enabled,
          dnd_start: settings.dnd_start,
          dnd_end: settings.dnd_end,
          allow_severe_during_dnd: settings.allow_severe_during_dnd,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('Saved', 'Your notification settings have been updated.');
    } catch (err) {
      console.error('NOTIFICATION SETTINGS SAVE ERROR:', err);
      Alert.alert('Error', 'Could not save your settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const WEEKDAYS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  ];

  const DND_START_OPTIONS = ['20:00', '21:00', '22:00', '23:00'];
  const DND_END_OPTIONS = ['05:00', '06:00', '07:00', '08:00'];

  if (loading || !settings) {
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
        <View className="px-6 pt-4 pb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            className="mb-4 self-start"
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">
            Notifications
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Alerts and weekly summary
          </Text>
        </View>

        <Section>
          <ToggleRow
            label="Enable all notifications"
            subtitle="Turn off to silence everything below"
            value={settings.master_enabled}
            onChange={() => toggle('master_enabled')}
          />
        </Section>

        <Section title="Alerts">
          <ToggleRow
            label="Ongoing migraine alerts"
            subtitle="Get notified when they log a migraine"
            value={settings.severe_alerts}
            onChange={() => toggle('severe_alerts')}
            disabled={!masterOn}
          />

          {masterOn && settings.severe_alerts && (
            <>
              <Divider />
              <SeverityRow
                value={settings.severe_threshold}
                onChange={(v) => setChoice('severe_threshold', v)}
              />
            </>
          )}
        </Section>

        <Section title="Weekly digest">
          <ToggleRow
            label="Weekly summary"
            subtitle="A short recap of how their week went"
            value={settings.weekly_digest}
            onChange={() => toggle('weekly_digest')}
            disabled={!masterOn}
          />
          {masterOn && settings.weekly_digest && (
            <>
              <Divider />
              <ChoiceRow
                label="Send on"
                options={WEEKDAYS}
                value={settings.weekly_digest_day}
                onChange={(v) => setChoice('weekly_digest_day', v)}
              />
            </>
          )}
        </Section>

        <Section title="Do not disturb">
          <ToggleRow
            label="Do not disturb mode"
            subtitle="Silence notifications during set hours"
            value={settings.dnd_enabled}
            onChange={() => toggle('dnd_enabled')}
            disabled={!masterOn}
          />

          {masterOn && settings.dnd_enabled && (
            <>
              <Divider />
              <ChoiceRow
                label="Start time"
                options={DND_START_OPTIONS.map((t) => ({
                  value: t,
                  label: to12Hour(t),
                }))}
                value={settings.dnd_start}
                onChange={(v) => setChoice('dnd_start', v)}
              />
              <Divider />
              <ChoiceRow
                label="End time"
                options={DND_END_OPTIONS.map((t) => ({
                  value: t,
                  label: to12Hour(t),
                }))}
                value={settings.dnd_end}
                onChange={(v) => setChoice('dnd_end', v)}
              />
            </>
          )}

          <Divider />
          <ToggleRow
            label="Allow alerts during DND"
            subtitle="So urgent migraines still reach you"
            value={settings.allow_severe_during_dnd}
            onChange={() => toggle('allow_severe_during_dnd')}
            disabled={!masterOn}
          />
        </Section>

        <View className="mx-6">
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className={`items-center rounded-full py-4 active:opacity-80 ${
              saving ? 'bg-elevated' : 'bg-brand'
            }`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#f1ebf9" />
            ) : (
              <Text className="font-plein-medium text-base text-text-inverse">
                Save settings
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}