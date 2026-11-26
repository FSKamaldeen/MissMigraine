import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useLogDraft } from '../LogDraftContext';
import Calendar from '../../../../components/common/Calendar';
import { formatLongDate } from '../../../../utils/dateUtils';

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function DateTimeField({ label, value, onChange, maxDate }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const current = new Date(value);

  const handleDateChange = (newDate) => {
    const merged = new Date(newDate);
    merged.setHours(current.getHours(), current.getMinutes(), 0, 0);
    onChange(merged);
    setShowCalendar(false);
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'dismissed') return;
    if (!selectedTime) return;
    const merged = new Date(current);
    merged.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    onChange(merged);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 font-plein-medium text-sm text-text-secondary">{label}</Text>

      <Pressable
        onPress={() => { setShowTimePicker(false); setShowCalendar((s) => !s); }}
        className="mb-2 flex-row items-center justify-between rounded-2xl bg-elevated px-5 py-4 active:opacity-70"
      >
        <Text className="font-plein-medium text-base text-text-primary">{formatLongDate(current)}</Text>
        <MaterialCommunityIcons name={showCalendar ? 'chevron-up' : 'calendar-blank-outline'} size={20} color="#ad89dc" />
      </Pressable>

      {showCalendar && (
        <View className="mb-2">
          <Calendar mode="single" value={current} maxDate={maxDate || new Date()} onChange={handleDateChange} />
        </View>
      )}

      <Pressable
        onPress={() => { setShowCalendar(false); setShowTimePicker((s) => !s); }}
        className="flex-row items-center justify-between rounded-2xl bg-elevated px-5 py-4 active:opacity-70"
      >
        <Text className="font-plein-medium text-base text-text-primary">{formatTime(current)}</Text>
        <MaterialCommunityIcons name={showTimePicker ? 'chevron-up' : 'clock-outline'} size={20} color="#ad89dc" />
      </Pressable>

      {showTimePicker && Platform.OS === 'ios' && (
        <View className="mt-2 rounded-2xl border border-elevated bg-surface p-3">
          <DateTimePicker value={current} mode="time" is24Hour={false} display="spinner" onChange={handleTimeChange} themeVariant="dark" textColor="#f1ebf9" />
          <Pressable onPress={() => setShowTimePicker(false)} className="mt-2 items-center">
            <Text className="font-plein-medium text-sm text-brand-light">Done</Text>
          </Pressable>
        </View>
      )}

      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker value={current} mode="time" is24Hour={false} display="default" onChange={handleTimeChange} />
      )}
    </View>
  );
}

export default function LogTimeStep({ navigation, route }) {
  const { draft, updateDraft } = useLogDraft();
  const startDate = new Date(draft.startDateTime);
  const endDate = draft.endDateTime ? new Date(draft.endDateTime) : null;

  const returnTo = route.params?.returnTo;

  const handleContinue = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.navigate('LogSymptomsStep');
    }
  };

  const handleStartChange = (newDate) => {
    const patch = { startDateTime: newDate.toISOString() };
    if (endDate && newDate > endDate) { patch.endDateTime = null; patch.stillOngoing = true; }
    updateDraft(patch);
  };

  const handleEndChange = (newDate) => {
    if (newDate < startDate) return;
    updateDraft({ endDateTime: newDate.toISOString(), stillOngoing: false });
  };

  const handleToggleOngoing = () => {
    if (draft.stillOngoing) {
      const end = new Date(startDate.getTime() + 60 * 60 * 1000);
      updateDraft({ stillOngoing: false, endDateTime: end.toISOString() });
    } else {
      updateDraft({ stillOngoing: true, endDateTime: null });
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-1 px-8 pt-4">

        {/* Back Arrow */}
        <View className="mb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} className="self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="h-1.5 w-full mb-8 overflow-hidden rounded-full bg-elevated">
          <View
            style={{
              width: `${(2 / 6) * 100}%`,
              height: '100%',
              backgroundColor: '#ad89dc',
              borderRadius: 999,
            }}
          />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-2 mb-8">
            <Text className="font-reem text-4xl text-text-primary mb-3">When did it start and end?</Text>
            <Text className="font-plein text-base text-text-secondary leading-6">
              Set the start time. Then either set the end time or mark it as still ongoing.
            </Text>
          </View>

          <DateTimeField label="Started" value={draft.startDateTime} onChange={handleStartChange} maxDate={new Date()} />

          <Pressable
            onPress={handleToggleOngoing}
            className="mb-4 flex-row items-center justify-between rounded-2xl bg-elevated px-5 py-4 active:opacity-70"
          >
            <View className="flex-1 pr-3">
              <Text className="font-plein-medium text-sm text-text-primary">Still ongoing?</Text>
              <Text className="mt-1 font-plein text-xs text-text-muted">Turn off to set an end time.</Text>
            </View>
            <View className={`h-7 w-12 items-center justify-center rounded-full ${draft.stillOngoing ? 'bg-brand' : 'bg-surface'}`}>
              <View className={`h-5 w-5 rounded-full bg-text-primary ${draft.stillOngoing ? 'mr-auto ml-1' : 'ml-auto mr-1'}`} />
            </View>
          </Pressable>

          {!draft.stillOngoing && endDate && (
            <DateTimeField label="Ended" value={draft.endDateTime} onChange={handleEndChange} maxDate={new Date()} />
          )}

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            className="mt-4 items-center rounded-full py-4 bg-brand active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-base text-text-inverse">
              Continue
            </Text>
          </Pressable>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}