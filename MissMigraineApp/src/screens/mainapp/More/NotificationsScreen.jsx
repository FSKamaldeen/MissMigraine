import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  master_enabled: true,
  reminder_logging_enabled: true,
  reminder_logging_time: '20:00:00',
  reminder_logging_frequency: 'daily',
  reminder_medication_enabled: true,
  reminder_medication_time: '09:00:00',
  reminder_cycle_enabled: true,
  reminder_cycle_days_before: 2,
  reminder_weather_enabled: true,
  reminder_weather_threshold: 10,
  reminder_insights_enabled: true,
  reminder_emergency_enabled: true,
  notification_sound_enabled: true,
  notification_vibration_enabled: true,
  do_not_disturb_start: '22:00:00',
  do_not_disturb_end: '07:00:00',
};

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

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
        <Text className="font-plein-medium text-base text-text-primary">{label}</Text>
        {subtitle && (
          <Text className="mt-1 font-plein text-sm leading-5 text-text-muted">{subtitle}</Text>
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
      <Text className="mb-3 font-plein-medium text-sm text-text-secondary">{label}</Text>

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

// ─────────────────────────────────────────────────────
// Helpers — "HH:MM:SS" ↔ "H:MM AM/PM"
// ─────────────────────────────────────────────────────

function dbTimeToLabel(dbTime) {
  if (!dbTime) return '';
  const [h, m] = dbTime.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function labelToDbTime(label) {
  const match = label.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  if (!match) return null;
  let [, hourStr, minuteStr, period] = match;
  let hour = parseInt(hourStr, 10);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${minuteStr}:00`;
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const masterOn = settings.master_enabled;

  // Load once
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;

        if (data) {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
      } catch (err) {
        console.log('Error loading notification settings:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Local-only updates (no save until Save button pressed)
  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setChoice = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Explicit save
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You are not signed in.');
        return;
      }

      const { error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            user_id: user.id,
            ...settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      Alert.alert('Saved', 'Your notification settings have been updated.');
    } catch (err) {
      console.log('Error saving notification settings:', err);
      Alert.alert('Error', 'Could not save your settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Choice options
  const REMINDER_TIMES = ['6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];
  const REMINDER_FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekly', label: 'Weekly' },
  ];
  const DAYS_BEFORE = ['1', '2', '3', '4', '5'];
  const PRESSURE_THRESHOLDS = ['5', '10', '15', '20'];
  const DND_START = ['8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'];
  const DND_END = ['5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM'];

  // Loading
  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="px-6 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ad89dc" />
          <Text className="mt-4 font-plein text-sm text-text-muted">Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">Notifications</Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Reminders, insights, and quiet hours
          </Text>
        </View>

        {/* Master toggle */}
        <Section>
          <ToggleRow
            label="Enable all notifications"
            subtitle="Turn off to silence everything below"
            value={settings.master_enabled}
            onChange={() => toggle('master_enabled')}
          />
        </Section>

        {/* Logging reminders */}
        <Section title="Logging reminders">
          <ToggleRow
            label="Daily log reminder"
            subtitle="A gentle nudge to log how you're doing"
            value={settings.reminder_logging_enabled}
            onChange={() => toggle('reminder_logging_enabled')}
            disabled={!masterOn}
          />
          {masterOn && settings.reminder_logging_enabled && (
            <>
              <Divider />
              <ChoiceRow
                label="Reminder time"
                options={REMINDER_TIMES}
                value={dbTimeToLabel(settings.reminder_logging_time)}
                onChange={(label) => {
                  const dbTime = labelToDbTime(label);
                  if (dbTime) setChoice('reminder_logging_time', dbTime);
                }}
              />
              <Divider />
              <ChoiceRow
                label="How often"
                options={REMINDER_FREQUENCIES}
                value={settings.reminder_logging_frequency}
                onChange={(v) => setChoice('reminder_logging_frequency', v)}
              />
            </>
          )}
        </Section>

        {/* Medication reminders */}
        <Section title="Medication reminders">
          <ToggleRow
            label="Medication reminder"
            subtitle="Nudge when it's time to take your medication"
            value={settings.reminder_medication_enabled}
            onChange={() => toggle('reminder_medication_enabled')}
            disabled={!masterOn}
          />
          {masterOn && settings.reminder_medication_enabled && (
            <>
              <Divider />
              <ChoiceRow
                label="Reminder time"
                options={['8:00 AM', '9:00 AM', '12:00 PM', '6:00 PM', '9:00 PM']}
                value={dbTimeToLabel(settings.reminder_medication_time)}
                onChange={(label) => {
                  const dbTime = labelToDbTime(label);
                  if (dbTime) setChoice('reminder_medication_time', dbTime);
                }}
              />
            </>
          )}
        </Section>

        {/* Cycle reminders */}
        <Section title="Cycle reminders">
          <ToggleRow
            label="Upcoming period reminder"
            subtitle="A heads-up before your period is expected"
            value={settings.reminder_cycle_enabled}
            onChange={() => toggle('reminder_cycle_enabled')}
            disabled={!masterOn}
          />
          {masterOn && settings.reminder_cycle_enabled && (
            <>
              <Divider />
              <ChoiceRow
                label="Days before"
                options={DAYS_BEFORE}
                value={String(settings.reminder_cycle_days_before)}
                onChange={(v) => setChoice('reminder_cycle_days_before', parseInt(v, 10))}
              />
            </>
          )}
        </Section>

        {/* Weather */}
        <Section title="Weather alerts">
          <ToggleRow
            label="Weather change alerts"
            subtitle="When pressure shifts might affect you"
            value={settings.reminder_weather_enabled}
            onChange={() => toggle('reminder_weather_enabled')}
            disabled={!masterOn}
          />
          {masterOn && settings.reminder_weather_enabled && (
            <>
              <Divider />
              <ChoiceRow
                label="Alert threshold (hPa change)"
                options={PRESSURE_THRESHOLDS}
                value={String(settings.reminder_weather_threshold)}
                onChange={(v) => setChoice('reminder_weather_threshold', parseInt(v, 10))}
              />
            </>
          )}
        </Section>

        {/* Insights */}
        <Section title="Insights & reports">
          <ToggleRow
            label="Weekly insight summary"
            subtitle="A recap of your week's patterns"
            value={settings.reminder_insights_enabled}
            onChange={() => toggle('reminder_insights_enabled')}
            disabled={!masterOn}
          />
        </Section>

        {/* Emergency */}
        <Section title="Emergency">
          <ToggleRow
            label="Emergency alerts"
            subtitle="Receive alerts for severe migraines"
            value={settings.reminder_emergency_enabled}
            onChange={() => toggle('reminder_emergency_enabled')}
            disabled={!masterOn}
          />
        </Section>

        {/* Sound & appearance */}
        <Section title="Sound & appearance">
          <ToggleRow
            label="Notification sound"
            subtitle="Play a sound for notifications"
            value={settings.notification_sound_enabled}
            onChange={() => toggle('notification_sound_enabled')}
            disabled={!masterOn}
          />
          <Divider />
          <ToggleRow
            label="Vibration"
            subtitle="Vibrate for notifications"
            value={settings.notification_vibration_enabled}
            onChange={() => toggle('notification_vibration_enabled')}
            disabled={!masterOn}
          />
        </Section>

        {/* Do not disturb */}
        <Section title="Do not disturb">
          <ToggleRow
            label="Do not disturb mode"
            subtitle="Silence notifications during set hours"
            value={!!settings.do_not_disturb_start}
            onChange={() => {
              if (settings.do_not_disturb_start) {
                setChoice('do_not_disturb_start', null);
                setChoice('do_not_disturb_end', null);
              } else {
                setChoice('do_not_disturb_start', '22:00:00');
                setChoice('do_not_disturb_end', '07:00:00');
              }
            }}
            disabled={!masterOn}
          />
          {masterOn && settings.do_not_disturb_start && (
            <>
              <Divider />
              <ChoiceRow
                label="Start time"
                options={DND_START}
                value={dbTimeToLabel(settings.do_not_disturb_start)}
                onChange={(label) => {
                  const dbTime = labelToDbTime(label);
                  if (dbTime) setChoice('do_not_disturb_start', dbTime);
                }}
              />
              <Divider />
              <ChoiceRow
                label="End time"
                options={DND_END}
                value={dbTimeToLabel(settings.do_not_disturb_end)}
                onChange={(label) => {
                  const dbTime = labelToDbTime(label);
                  if (dbTime) setChoice('do_not_disturb_end', dbTime);
                }}
              />
            </>
          )}
        </Section>

        {/* Save button */}
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