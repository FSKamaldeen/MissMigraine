import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../../lib/supabase';
import { useLogDraft } from './LogDraftContext';
import { useMigraineLogs } from '../../../hooks/useMigraineLogs';
import { useCycleData } from '../../../hooks/useCycleData';
import { formatDateTimeLabel } from '../../../utils/dateUtils';
import { CYCLE_PHASE_META } from '../../../constants/colors';
import { getTipForUserLog } from '../../../constants/migraineData';

// ─────────────────────────────────────────────────────
// Editable row
// ─────────────────────────────────────────────────────

function EditableRow({ label, value, muted = false, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-elevated py-4 active:opacity-60"
    >
      <View className="flex-1 pr-3">
        <Text className="mb-1 font-reem text-xs uppercase tracking-wider text-text-muted">
          {label}
        </Text>
        <Text
          className={`font-plein text-base leading-6 ${
            muted ? 'text-text-muted' : 'text-text-primary'
          }`}
        >
          {value}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#ad89dc" />
    </Pressable>
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
// Ongoing attack tip modal
// ─────────────────────────────────────────────────────

function OngoingTipModal({ visible, tip, triggers, onClose }) {
  if (!tip) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-background/80">
        <View className="rounded-t-3xl bg-surface px-6 pt-6 pb-10">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="font-reem text-2xl text-text-primary">
              A note for you
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
// Main screen
// ─────────────────────────────────────────────────────

export default function LogReviewScreen({ navigation }) {
  const { draft, resetDraft } = useLogDraft();
  const { addLog } = useMigraineLogs();
  const { cycleSummary } = useCycleData();
  const [weather, setWeather] = useState(null);

  const [saving, setSaving] = useState(false);
  const [tipModalVisible, setTipModalVisible] = useState(false);
  const [tipData, setTipData] = useState(null);

  const startDate = new Date(draft.startDateTime);
  const endDate = draft.endDateTime ? new Date(draft.endDateTime) : null;

  const durationHours =
    endDate && endDate > startDate
      ? (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      : null;

  const cyclePhaseKey = cycleSummary?.phaseKey || 'luteal';
  const cyclePhase = CYCLE_PHASE_META[cyclePhaseKey];

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { lat: 6.9271, lon: 79.8612 },
        });
        if (cancelled) return;
        if (!error && data) setWeather(data);
      } catch (err) {
        console.log('Weather fetch failed:', err);
      }
    };
    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  const jumpTo = (stepName) => {
    navigation.navigate(stepName, { returnTo: 'LogReview' });
  };

  const navigateToRecords = () => {
    navigation.popToTop();
    navigation.getParent()?.navigate('RecordsTab');
  };

  const handleSave = async () => {
    setSaving(true);

    const newLog = {
      dateTime: draft.startDateTime,
      startDateTime: draft.startDateTime,
      endDateTime: draft.endDateTime,
      stillOngoing: draft.stillOngoing,
      durationHours: durationHours ? Number(durationHours.toFixed(1)) : null,
      intensity: draft.intensity,
      symptoms: draft.symptoms,
      hasAura: draft.hasAura,
      auraPresent: draft.hasAura,
      auraDescription: draft.auraDescription || '',
      triggers: draft.triggers,
      medications: draft.medications,
      cyclePhaseKey,
      cycleDay: cycleSummary?.dayInCycle || null,
      notes: draft.notes,
      weather: weather ? { temp: weather.temperature, pressure: weather.pressure } : null,
    };

    const result = await addLog(newLog);
    setSaving(false);

    if (result.success) {
      const wasOngoing = draft.stillOngoing;
      const triggerList = draft.triggers || [];

      resetDraft();

      if (wasOngoing) {
        // Show the tip modal for ongoing attacks
        const tip = getTipForUserLog(triggerList);
        setTipData({ tip, triggers: triggerList });
        setTipModalVisible(true);
      } else {
        Alert.alert('Log saved', 'Your migraine has been recorded.', [
          { text: 'OK', onPress: navigateToRecords },
        ]);
      }
    } else {
      console.log('Save log error:', result.error);
      Alert.alert(
        'Error',
        result.error?.message || 'Could not save your log. Please try again.'
      );
    }
  };

  const handleTipClose = () => {
    setTipModalVisible(false);
    setTipData(null);
    navigateToRecords();
  };

  const startLabel = formatDateTimeLabel(draft.startDateTime);
  const endLabel = draft.stillOngoing
    ? 'Still ongoing'
    : endDate
    ? formatDateTimeLabel(draft.endDateTime)
    : 'Not set';

  const durationLabel =
    durationHours != null
      ? durationHours < 1
        ? `${Math.round(durationHours * 60)} min`
        : `${durationHours.toFixed(1)} hours`
      : 'Ongoing';

  const weatherLabel = weather
    ? `${Math.round(weather.temperature)}°C ― ${weather.pressure} hPa`
    : 'Loading...';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View className="px-10 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">Review your log</Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Tap any row to edit it.
          </Text>
        </View>

        <View className="px-10">
          <View className="mb-6">
            <View className="mb-3 px-1">
              <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
                Details
              </Text>
            </View>

            <View className="rounded-[24px] bg-surface px-5">
              <EditableRow label="Intensity" value={`${draft.intensity} / 10`} onPress={() => jumpTo('LogMain')} />
              <EditableRow label="Started" value={startLabel} onPress={() => jumpTo('LogTimeStep')} />
              <EditableRow label="Ended" value={endLabel} muted={draft.stillOngoing} onPress={() => jumpTo('LogTimeStep')} />
              <EditableRow
                label="Symptoms"
                value={draft.symptoms.length ? draft.symptoms.join(', ') : 'None selected'}
                muted={!draft.symptoms.length}
                onPress={() => jumpTo('LogSymptomsStep')}
              />
              {draft.hasAura && (
                <EditableRow
                  label="Aura"
                  value={draft.auraDescription || 'Yes (no description)'}
                  onPress={() => jumpTo('LogSymptomsStep')}
                />
              )}
              <EditableRow
                label="Triggers"
                value={draft.triggers.length ? draft.triggers.join(', ') : 'None selected'}
                muted={!draft.triggers.length}
                onPress={() => jumpTo('LogTriggersStep')}
              />
              <EditableRow
                label="Medications"
                value={draft.medications.length ? draft.medications.join(', ') : 'None selected'}
                muted={!draft.medications.length}
                onPress={() => jumpTo('LogMedicationStep')}
              />
              <View className="border-b-0">
                <EditableRow
                  label="Notes"
                  value={draft.notes || 'None'}
                  muted={!draft.notes}
                  onPress={() => jumpTo('LogNotesStep')}
                />
              </View>
            </View>
          </View>

          <View className="mb-6">
            <View className="mb-3 px-1">
              <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
                Auto-filled
              </Text>
            </View>
            <View className="rounded-[24px] bg-surface px-5 pt-1 pb-1">
              <InfoRow icon="clock-outline" label="Duration" value={durationLabel} />
              <InfoRow icon="circle-slice-8" label="Cycle phase" value={cyclePhase?.name || 'Not set'} />
              {cycleSummary?.dayInCycle && (
                <InfoRow icon="calendar-heart" label="Cycle day" value={`Day ${cycleSummary.dayInCycle}`} />
              )}
              <View className="border-b-0">
                <InfoRow icon="weather-partly-cloudy" label="Weather" value={weatherLabel} />
              </View>
            </View>
          </View>

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
              <Text className="font-plein-medium text-base text-text-inverse">Save log</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <OngoingTipModal
        visible={tipModalVisible}
        tip={tipData?.tip}
        triggers={tipData?.triggers || []}
        onClose={handleTipClose}
      />
    </SafeAreaView>
  );
}