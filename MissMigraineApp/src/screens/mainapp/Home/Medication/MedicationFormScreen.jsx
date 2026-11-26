import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { supabase } from '../../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateKey) {
  if (!dateKey) return 'Select date';
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseDate(dateKey) {
  if (!dateKey) return new Date();
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Map DB type → UI label
function dbTypeToLabel(dbType) {
  if (dbType === 'acute') return 'Acute';
  if (dbType === 'preventive') return 'Preventive';
  return 'Other';
}

// Map UI label → DB type
function labelToDbType(label) {
  if (label === 'Acute') return 'acute';
  if (label === 'Preventive') return 'preventive';
  return 'other';
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function MedicationFormScreen({ navigation, route }) {
  const medId = route.params?.medId;
  const isEditing = !!medId;

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState('Acute');
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState('Daily');
  const [hasReminder, setHasReminder] = useState(false);
  const [startDate, setStartDate] = useState(formatDateKey(new Date()));
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);

  // UI state
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const TYPE_OPTIONS = ['Acute', 'Preventive', 'Other'];
  const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'As Needed'];

  // ─── Load existing med when editing ──────────────────
  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;
    const loadMed = async () => {
      try {
        const { data, error } = await supabase
          .from('medications')
          .select('*')
          .eq('id', medId)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        if (!data) {
          Alert.alert('Not found', 'This medication could not be found.');
          navigation.goBack();
          return;
        }

        setName(data.name || '');
        setDosage(data.dosage || '');
        setType(dbTypeToLabel(data.type));
        setIsActive(data.is_active !== false);
        setFrequency(
          data.frequency
            ? data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1).toLowerCase()
            : 'Daily'
        );
        setHasReminder(!!data.frequency);
        setStartDate(data.start_date || formatDateKey(new Date()));
        if (data.end_date) {
          setEndDate(data.end_date);
          setHasEndDate(true);
        }
      } catch (err) {
        if (cancelled) return;
        console.log('Error loading medication:', err);
        Alert.alert('Error', 'Could not load the medication.');
        navigation.goBack();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMed();
    return () => {
      cancelled = true;
    };
  }, [isEditing, medId, navigation]);

  // ─── Save (insert or update) ─────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter the medication name.');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You need to be signed in.');
        return;
      }

      const payload = {
        user_id: user.id,
        name: name.trim(),
        dosage: dosage.trim() || null,
        type: labelToDbType(type),
        frequency: hasReminder ? frequency.toLowerCase() : 'as needed',
        start_date: startDate,
        end_date: hasEndDate && endDate ? endDate : null,
        is_active: isActive,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('medications')
          .update(payload)
          .eq('id', medId);

        if (error) throw error;
        Alert.alert('Saved', 'Medication updated successfully.');
      } else {
        const { error } = await supabase
          .from('medications')
          .insert(payload);

        if (error) throw error;
        Alert.alert('Added', 'Medication added to your list.');
      }

      navigation.goBack();
    } catch (err) {
      console.log('Error saving medication:', err);
      Alert.alert('Error', err.message || 'Could not save the medication.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Delete medication',
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await supabase
                .from('medications')
                .delete()
                .eq('id', medId);

              if (error) throw error;
              navigation.goBack();
            } catch (err) {
              console.log('Error deleting medication:', err);
              Alert.alert('Error', 'Could not delete the medication.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ─── Loading (edit mode) ─────────────────────────────
  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="px-6 pt-4 pb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            className="mb-4 self-start"
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ad89dc" />
          <Text className="mt-4 font-plein text-sm text-text-muted">
            Loading medication...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      
      {/* Header */}
      <View className="px-6 pt-4 pb-6">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          className="mb-4 self-start"
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
        </Pressable>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-reem text-4xl text-text-primary">
              {isEditing ? 'Edit Medication' : 'Add Medication'}
            </Text>
            <Text className="mt-1 font-plein text-base text-text-muted">
              {isEditing
                ? 'Update your medication details'
                : 'Track a new medication'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          
          {/* Name */}
          <Text className="mb-2 font-plein-medium text-base text-text-secondary">
            Medication Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sumatriptan"
            placeholderTextColor="#c8b0e8"
            className="mb-5 h-[54px] rounded-2xl bg-surface px-5 font-plein text-base text-text-primary"
          />

          {/* Dosage */}
          <Text className="mb-2 font-plein-medium text-base text-text-secondary">
            Dosage
          </Text>
          <TextInput
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g. 50mg"
            placeholderTextColor="#c8b0e8"
            className="mb-5 h-[54px] rounded-2xl bg-surface px-5 font-plein text-base text-text-primary"
          />

          {/* Type */}
          <Text className="mb-2 font-plein-medium text-base text-text-secondary">
            Type
          </Text>
          <View className="mb-5 flex-row gap-2">
            {TYPE_OPTIONS.map((option) => {
              const isSelected = type === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setType(option)}
                  className={`flex-1 items-center justify-center rounded-2xl py-3 ${
                    isSelected
                      ? 'border-brand bg-brand'
                      : 'border-elevated bg-surface'
                  }`}
                >
                  <Text
                    className={`font-plein-medium text-sm ${
                      isSelected ? 'text-text-inverse' : 'text-text-muted'
                    }`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Active toggle */}
          <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-surface p-4 border-[1.5px] border-elevated">
            <View className="flex-1 pr-3">
              <Text className="font-plein-medium text-base text-text-primary">
                Active Status
              </Text>
              <Text className="mt-0.5 font-plein text-sm text-text-muted">
                {isActive
                  ? 'Currently taking this medication'
                  : 'Moved to past medications'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#472376', true: '#ad89dc' }}
              thumbColor={'#f1ebf9'}
            />
          </View>

          {/* Reminder toggle */}
          <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-surface p-4 border-[1.5px] border-elevated">
            <View className="flex-1 pr-3">
              <Text className="font-plein-medium text-base text-text-primary">
                Set Reminder
              </Text>
              <Text className="mt-0.5 font-plein text-sm text-text-muted">
                Get notified to take this
              </Text>
            </View>
            <Switch
              value={hasReminder}
              onValueChange={setHasReminder}
              trackColor={{ false: '#472376', true: '#ad89dc' }}
              thumbColor={'#f1ebf9'}
            />
          </View>

          {/* Reminder details */}
          {hasReminder && (
            <View className="mb-6 rounded-2xl bg-surface p-4 border-[1.5px] border-elevated">
              
              <Text className="mb-3 font-plein-medium text-sm text-text-secondary">
                Frequency
              </Text>
              <View className="mb-5 flex-row flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((f) => {
                  const isSelected = frequency === f;
                  return (
                    <Pressable
                      key={f}
                      onPress={() => setFrequency(f)}
                      className={`rounded-xl border-[1.5px] px-4 py-2.5 ${
                        isSelected
                          ? 'border-brand bg-brand/20'
                          : 'border-elevated bg-background'
                      }`}
                    >
                      <Text
                        className={`font-plein text-sm ${
                          isSelected ? 'text-brand-light' : 'text-text-muted'
                        }`}
                      >
                        {f}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Start date + End date */}
              <View className="mb-5 flex-row gap-3">
                <View className="flex-1">
                  <Text className="mb-2 font-plein-medium text-sm text-text-secondary">
                    Start Date
                  </Text>
                  <Pressable
                    onPress={() => setShowStartPicker(true)}
                    className="h-[54px] flex-row items-center justify-between rounded-xl bg-background px-4"
                  >
                    <Text className="font-plein text-base text-text-primary" numberOfLines={1}>
                      {formatDateDisplay(startDate)}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={18} color="#c8b0e8" />
                  </Pressable>
                </View>
                <View className="flex-1">
                  <Text className="mb-2 font-plein-medium text-sm text-text-secondary">
                    End Date
                  </Text>
                  <Pressable
                    onPress={() => {
                      if (!hasEndDate) setHasEndDate(true);
                      setShowEndPicker(true);
                    }}
                    className="h-[54px] flex-row items-center justify-between rounded-xl bg-background px-4"
                  >
                    <Text className="font-plein text-base text-text-primary" numberOfLines={1}>
                      {hasEndDate && endDate ? formatDateDisplay(endDate) : 'Ongoing'}
                    </Text>
                    <MaterialCommunityIcons name="calendar" size={18} color="#c8b0e8" />
                  </Pressable>
                </View>
              </View>

              {/* End date toggle */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="font-plein-medium text-sm text-text-secondary">
                    Has End Date?
                  </Text>
                  <Text className="mt-0.5 font-plein text-xs text-text-muted">
                    {hasEndDate ? 'Set a duration for this med' : 'No end date (ongoing)'}
                  </Text>
                </View>
                <Switch
                  value={hasEndDate}
                  onValueChange={(v) => {
                    setHasEndDate(v);
                    if (!v) setEndDate('');
                  }}
                  trackColor={{ false: '#472376', true: '#ad89dc' }}
                  thumbColor={'#f1ebf9'}
                  style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
              </View>

            </View>
          )}

          {/* Date pickers (native) */}
          {showStartPicker && (
            <DateTimePicker
              value={parseDate(startDate)}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (event.type === 'dismissed') return;
                if (date) setStartDate(formatDateKey(date));
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={parseDate(endDate || startDate)}
              mode="date"
              display="default"
              minimumDate={parseDate(startDate)}
              onChange={(event, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (event.type === 'dismissed') return;
                if (date) {
                  setEndDate(formatDateKey(date));
                  setHasEndDate(true);
                }
              }}
            />
          )}

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className={`mt-2 items-center rounded-full py-4 active:opacity-80 ${
              saving ? 'bg-elevated' : 'bg-brand'
            }`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ad89dc" />
            ) : (
              <Text className="font-plein-medium text-base text-text-inverse">
                {isEditing ? 'Save Changes' : 'Add Medication'}
              </Text>
            )}
          </Pressable>

          {/* Delete (only if editing) */}
          {isEditing && (
            <Pressable
              onPress={handleDelete}
              disabled={deleting}
              className={`mt-4 items-center rounded-full border-[1.5px] border-danger/30 bg-danger/10 py-4 active:bg-danger/20 ${
                deleting ? 'opacity-50' : ''
              }`}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#a01717" />
              ) : (
                <Text className="font-plein-medium text-base text-danger">
                  Delete Medication
                </Text>
              )}
            </Pressable>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}