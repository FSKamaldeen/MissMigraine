import React, { useState, useEffect } from 'react';
import { Alert, Pressable, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatLongDate } from '../../../../../utils/dateUtils';
import { validateCycleInput } from '../../../../../utils/cycleUtils';
import Calendar from '../../../../../components/common/Calendar';

const DEFAULT_PERIOD_DURATION_DAYS = 7;

export default function CycleInputForm({ initialData, onSave }) {
  const [lastPeriodStart, setLastPeriodStart] = useState(initialData?.lastPeriodStartDate || '');
  const [lastPeriodEnd, setLastPeriodEnd] = useState(initialData?.lastPeriodEndDate || '');
  const [cycleLength, setCycleLength] = useState(initialData?.averageCycleLength || '28');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // When the user picks a new start date, auto-suggest a 7-day end date only
  // if they haven't already set one.
  useEffect(() => {
    if (lastPeriodStart && !lastPeriodEnd) {
      const [y, m, d] = lastPeriodStart.split('-').map(Number);
      const end = new Date(y, m - 1, d);
      end.setDate(end.getDate() + DEFAULT_PERIOD_DURATION_DAYS - 1);
      setLastPeriodEnd(end.toISOString().split('T')[0]);
    }
  }, [lastPeriodStart]);

  const parseToDate = (value) => {
    if (!value) return new Date();
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatToKey = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleSave = async () => {
    const next = {
      lastPeriodStartDate: lastPeriodStart,
      lastPeriodEndDate: lastPeriodEnd,
      averageCycleLength: cycleLength,
      ovulationDay: '14', 
      notes: '', 
    };

    const { valid, error } = validateCycleInput(next);
    if (!valid) {
      Alert.alert('Check your input', error);
      return;
    }

    setSaving(true);
    await onSave(next);
    setSaving(false);
  };

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          Cycle Settings
        </Text>
      </View>

      <View className="mx-6 rounded-[24px] bg-surface p-5">
        
        <Text className="mb-5 font-plein text-sm text-text-muted leading-5">
          Keep these dates updated so we can accurately predict your phases and how they might connect to your migraines.
        </Text>

        {/* Last period start */}
        <Text className="mb-2 font-plein-medium text-sm text-text-secondary">
          Last period start
        </Text>
        <Pressable
          onPress={() => setShowStartPicker((s) => !s)}
          className="mb-2 h-[54px] flex-row items-center justify-between rounded-xl bg-elevated px-5 active:opacity-70"
        >
          <Text className="font-plein text-base text-text-primary">
            {lastPeriodStart ? formatLongDate(lastPeriodStart) : 'Select date'}
          </Text>
          <MaterialCommunityIcons
            name={showStartPicker ? 'chevron-up' : 'calendar-blank-outline'}
            size={20}
            color="#ad89dc"
          />
        </Pressable>
        {showStartPicker && (
          <View className="mb-4">
            <Calendar
              mode="single"
              value={parseToDate(lastPeriodStart)}
              maxDate={new Date()}
              onChange={(d) => {
                setLastPeriodStart(formatToKey(d));
                setShowStartPicker(false);
              }}
            />
          </View>
        )}

        {/* Last period end (editable) */}
        <Text className="mb-2 mt-4 font-plein-medium text-sm text-text-secondary">
          Period end
        </Text>
        <Pressable
          onPress={() => setShowEndPicker((s) => !s)}
          className="mb-2 h-[54px] flex-row items-center justify-between rounded-xl bg-elevated px-5 active:opacity-70"
        >
          <Text className="font-plein text-base text-text-primary">
            {lastPeriodEnd ? formatLongDate(lastPeriodEnd) : 'Select end date'}
          </Text>
          <MaterialCommunityIcons
            name={showEndPicker ? 'chevron-up' : 'calendar-blank-outline'}
            size={20}
            color="#ad89dc"
          />
        </Pressable>
        {showEndPicker && (
          <View className="mb-4">
            <Calendar
              mode="single"
              value={parseToDate(lastPeriodEnd)}
              minDate={parseToDate(lastPeriodStart)}
              maxDate={new Date()}
              onChange={(d) => {
                setLastPeriodEnd(formatToKey(d));
                setShowEndPicker(false);
              }}
            />
          </View>
        )}

        {/* Cycle length */}
        <Text className="mb-2 mt-4 font-plein-medium text-sm text-text-secondary">
          Average cycle length (days)
        </Text>
        <TextInput
          value={cycleLength}
          onChangeText={setCycleLength}
          placeholder="28"
          placeholderTextColor="#c8b0e8"
          keyboardType="number-pad"
          className="mb-6 h-[54px] rounded-xl bg-elevated px-5 font-plein text-base text-text-primary focus:border focus:border-brand"
        />

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          className={`items-center rounded-full py-4 active:opacity-80 ${
            saving ? 'bg-elevated' : 'bg-brand'
          }`}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ad89dc" />
          ) : (
            <Text className="font-plein-medium text-base text-text-inverse">
              Save changes
            </Text>
          )}
        </Pressable>

      </View>
    </View>
  );
}