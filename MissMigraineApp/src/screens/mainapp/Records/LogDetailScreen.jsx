import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, Text,
  TextInput, View, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { useMigraineLogs } from '../../../hooks/useMigraineLogs';
import { formatDateTimeLabel } from '../../../utils/dateUtils';
import { CYCLE_PHASE_META } from '../../../constants/colors';

// ─────────────────────────────────────────────────────
// Reusable form rows
// ─────────────────────────────────────────────────────

function FormRow({ label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-plein-medium text-sm text-text-secondary">{label}</Text>
      <TextInput
        value={String(value || '')}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#c8b0e8"
        keyboardType={keyboardType}
        className="h-[54px] rounded-2xl bg-elevated px-5 font-plein text-base text-text-primary focus:border focus:border-brand"
      />
    </View>
  );
}

function DateRow({ label, value, onPress }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-plein-medium text-sm text-text-secondary">{label}</Text>
      <Pressable
        onPress={onPress}
        className="h-[54px] flex-row items-center justify-between rounded-2xl bg-elevated px-5 active:opacity-70"
      >
        <Text className="font-plein text-base text-text-primary">
          {value ? formatDateTimeLabel(value) : 'Not set'}
        </Text>
        <MaterialCommunityIcons name="calendar-clock" size={20} color="#ad89dc" />
      </Pressable>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View className="flex-row items-center justify-between border-b border-elevated py-3">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name={icon} size={16} color="#ad89dc" />
        <Text className="font-plein text-sm text-text-secondary">{label}</Text>
      </View>
      <Text className="font-plein-medium text-base text-text-primary">{value}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function LogDetailScreen({ navigation, route }) {
  const { logId } = route.params || {};
  const { logs, loading, updateLog, deleteLog } = useMigraineLogs();

  const originalLog = logs.find((l) => l.id === logId);

  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Sync draft when log arrives
  useEffect(() => {
    if (originalLog && !draft) setDraft({ ...originalLog });
  }, [originalLog, draft]);

  // ─── Loading ─────────────────────────────────────────
  if (loading && !originalLog) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="px-6 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ad89dc" />
          <Text className="mt-4 font-plein text-sm text-text-muted">Loading log...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Not found ───────────────────────────────────────
  if (!originalLog || !draft) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="px-6 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">Log not found</Text>
        </View>
        <Text className="mt-10 text-center font-plein text-text-muted">
          This log may have been deleted.
        </Text>
      </SafeAreaView>
    );
  }

  const phase = CYCLE_PHASE_META[draft.cyclePhaseKey] || CYCLE_PHASE_META.luteal;

  // ─── Date change handlers ────────────────────────────
  const onStartChange = (event, selectedDate) => {
    if (Platform.OS === 'ios') setShowStartPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) setDraft({ ...draft, dateTime: selectedDate.toISOString() });
  };

  const onEndChange = (event, selectedDate) => {
    if (Platform.OS === 'ios') setShowEndPicker(false);
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      setDraft({
        ...draft,
        endDateTime: selectedDate.toISOString(),
        stillOngoing: false,
      });
    }
  };

  // ─── Open pickers (Android uses imperative API) ──────
const openStartPicker = () => {
  if (Platform.OS === 'android') {
    DateTimePickerAndroid.open({
      value: new Date(draft.dateTime),
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'dismissed' || !date) return;
        
        // Date selected — now open the time picker
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, time) => {
            if (timeEvent.type === 'dismissed' || !time) return;
            
            // Merge the selected time into the date
            const merged = new Date(date);
            merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setDraft({ ...draft, dateTime: merged.toISOString() });
          },
        });
      },
    });
  } else {
    setShowStartPicker(true);
  }
};

const openEndPicker = () => {
  if (Platform.OS === 'android') {
    const initial = draft.endDateTime ? new Date(draft.endDateTime) : new Date();
    
    DateTimePickerAndroid.open({
      value: initial,
      mode: 'date',
      onChange: (event, date) => {
        if (event.type === 'dismissed' || !date) return;
        
        DateTimePickerAndroid.open({
          value: date,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, time) => {
            if (timeEvent.type === 'dismissed' || !time) return;
            
            const merged = new Date(date);
            merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
            setDraft({
              ...draft,
              endDateTime: merged.toISOString(),
              stillOngoing: false,
            });
          },
        });
      },
    });
  } else {
    setShowEndPicker(true);
  }
};

  // ─── Save ────────────────────────────────────────────
  const handleSave = async () => {
    let durationHours = null;
    if (draft.endDateTime && !draft.stillOngoing) {
      const start = new Date(draft.dateTime);
      const end = new Date(draft.endDateTime);
      if (end > start) {
        durationHours = Number(((end - start) / (1000 * 60 * 60)).toFixed(1));
      }
    }

    setSaving(true);
    const result = await updateLog(logId, { ...draft, durationHours });
    setSaving(false);

    if (result.success) {
      Alert.alert('Saved', 'Log updated successfully.');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Could not update the log. Please try again.');
    }
  };

  // ─── Delete ──────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert('Delete log', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          const result = await deleteLog(logId);
          setDeleting(false);
          if (result.success) navigation.goBack();
          else Alert.alert('Error', 'Could not delete the log. Please try again.');
        },
      },
    ]);
  };
  
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-6 pt-4 pb-6">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
          <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
        </Pressable>
        <Text className="font-reem text-4xl text-text-primary">Log Details</Text>
        <Text className="mt-1 font-plein text-base text-text-muted">
          Update your migraine record
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="px-6">
          <DateRow label="Started" value={draft.dateTime} onPress={openStartPicker} />
          {Platform.OS === 'ios' && showStartPicker && (
            <DateTimePicker
              value={new Date(draft.dateTime)}
              mode="datetime"
              display="default"
              onChange={onStartChange}
            />
          )}

          <DateRow label="Ended (Optional)" value={draft.endDateTime} onPress={openEndPicker} />
          {Platform.OS === 'ios' && showEndPicker && (
            <DateTimePicker
              value={draft.endDateTime ? new Date(draft.endDateTime) : new Date()}
              mode="datetime"
              display="default"
              onChange={onEndChange}
            />
          )}

          <FormRow
            label="Intensity (1-10)"
            value={draft.intensity}
            onChangeText={(text) => setDraft({ ...draft, intensity: Number(text) || 0 })}
            keyboardType="number-pad"
            placeholder="e.g. 7"
          />

          <FormRow
            label="Symptoms"
            value={draft.symptoms?.join(', ')}
            onChangeText={(text) =>
              setDraft({ ...draft, symptoms: text.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="e.g. Nausea, Light sensitivity"
          />

          <FormRow
            label="Triggers"
            value={draft.triggers?.join(', ')}
            onChangeText={(text) =>
              setDraft({ ...draft, triggers: text.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="e.g. Stress, Lack of sleep"
          />

          <FormRow
            label="Medications taken"
            value={draft.medications?.join(', ')}
            onChangeText={(text) =>
              setDraft({ ...draft, medications: text.split(',').map((s) => s.trim()).filter(Boolean) })
            }
            placeholder="e.g. Sumatriptan, Ibuprofen"
          />

          <FormRow
            label="Notes"
            value={draft.notes}
            onChangeText={(text) => setDraft({ ...draft, notes: text })}
            placeholder="Add any extra details here..."
          />

          {/* Auto-filled / Read-only info */}
          <View className="mt-2 mb-6">
            <View className="mb-3 px-1">
              <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
                Auto-filled
              </Text>
            </View>

            <View className="rounded-[24px] bg-surface px-5 pt-1 pb-1">
              <InfoRow
                icon="clock-outline"
                label="Logged at"
                value={
                  originalLog.dateTime
                    ? formatDateTimeLabel(originalLog.dateTime)
                    : 'Unknown'
                }
              />
              <InfoRow
                icon="circle-slice-8"
                label="Cycle phase"
                value={CYCLE_PHASE_META[originalLog.cyclePhaseKey]?.name || 'Not recorded'}
              />
              {originalLog.cycleDay && (
                <InfoRow
                  icon="calendar-heart"
                  label="Cycle day"
                  value={`Day ${originalLog.cycleDay}`}
                />
              )}
              <View className="border-b-0">
                <InfoRow
                  icon="weather-partly-cloudy"
                  label="Weather"
                  value={
                    originalLog.weather?.temp != null && originalLog.weather?.pressure != null
                      ? `${Math.round(originalLog.weather.temp)}°C · ${originalLog.weather.pressure} hPa`
                      : 'Not recorded'
                  }
                />
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            className={`mt-4 items-center rounded-full py-4 active:opacity-80 ${saving ? 'bg-elevated' : 'bg-brand'}`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ad89dc" />
            ) : (
              <Text className="font-plein-medium text-base text-text-inverse">Save Changes</Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleDelete}
            disabled={deleting}
            className={`mt-4 items-center rounded-full border-[1.5px] border-danger/30 bg-danger/10 py-4 active:bg-danger/20 ${deleting ? 'opacity-50' : ''}`}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#a01717" />
            ) : (
              <Text className="font-plein-medium text-base text-danger">Delete Log</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}