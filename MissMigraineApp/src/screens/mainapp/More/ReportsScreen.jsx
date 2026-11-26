import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useMigraineLogs } from '../../../hooks/useMigraineLogs';
import { supabase } from '../../../lib/supabase';
import {
  buildReportHTML,
  computeReportData,
  getRangeStart,
  RANGE_LABELS,
} from '../../../utils/reportBuilder';

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <View className="mb-6">
      <View className="mb-3 px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          {title}
        </Text>
      </View>
      <View className="mx-6 rounded-[24px] bg-surface overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function RangeOption({ label, value, selected, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(value)}
      className={`flex-1 items-center rounded-2xl py-4 active:opacity-70 ${
        selected ? 'bg-brand' : 'bg-elevated'
      }`}
    >
      <Text
        className={`font-plein-medium text-base ${
          selected ? 'text-text-inverse' : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Stat({ value, label }) {
  return (
    <View className="flex-1 items-center justify-center px-1">
      <Text className="font-reem text-3xl text-text-primary">{value}</Text>
      <Text className="mt-1 text-center font-plein text-sm text-text-muted">{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function ReportsScreen({ navigation }) {
  const { logs } = useMigraineLogs();
  const [range, setRange] = useState('month');
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('full_name, preferred_name, email')
        .eq('id', authUser.id)
        .maybeSingle();
      setUser(data || {});
    })();
  }, []);

  const RANGE_OPTIONS = [
    { value: 'week', label: '7 days' },
    { value: 'month', label: '30 days' },
    { value: '3m', label: '3 months' },
    { value: '6m', label: '6 months' },
  ];

  // Compute report data from the raw logs
  const reportData = computeReportData(logs, range);
  const { filteredLogs, stats } = reportData;
  const hasLogs = filteredLogs.length > 0;

  const handleShare = async () => {
    if (!hasLogs) {
      Alert.alert('Nothing to report', 'There are no migraines logged in this period. Try a wider range.');
      return;
    }

    setGenerating(true);
    try {
      const html = buildReportHTML({
        user: user || {},
        rangeLabel: RANGE_LABELS[range],
        startDate: new Date(getRangeStart(range)).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
        endDate: new Date().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        }),
        logs: filteredLogs,
        stats,
        phaseBreakdown: reportData.phaseBreakdown,
        topSymptoms: reportData.topSymptoms,
        topTriggers: reportData.topTriggers,
        correlationInsight: reportData.correlationInsight,
      });

      const { uri } = await Print.printToFileAsync({ html });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing unavailable', 'Your device does not support sharing.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share your migraine report',
        UTI: 'com.adobe.pdf',
      });
    } catch (err) {
      console.log('SHARE ERROR:', err);
      Alert.alert('Error', 'Could not generate the report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">Generate report</Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            A PDF summary of your migraine history
          </Text>
        </View>

        {/* Range selector */}
        <Section title="Date range">
          <View className="p-4">
            <View className="flex-row gap-2">
              {RANGE_OPTIONS.map((opt) => (
                <RangeOption
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  selected={range === opt.value}
                  onPress={setRange}
                />
              ))}
            </View>
          </View>
        </Section>

        {/* Preview */}
        <Section title="Preview">
          <View className="px-5 py-4">
            {hasLogs ? (
              <View className="flex-row items-center mb-4">
                <Stat value={stats.count} label="migraines" />
                <View className="w-[2px] h-10 bg-elevated" />
                <Stat value={stats.avgIntensity} label="avg intensity" />
                <View className="w-[2px] h-10 bg-elevated" />
                <Stat value={stats.avgDuration} label="avg duration" />
              </View>
            ) : (
              <View className="items-center py-4">
                <MaterialCommunityIcons name="file-document-outline" size={32} color="#472376" />
                <Text className="mt-3 text-center font-plein text-base text-text-muted">
                  No migraines logged in this period.
                </Text>
              </View>
            )}
          </View>
        </Section>

        {/* Info card */}
        <View className="mx-6 mb-6 rounded-[24px] bg-elevated p-5">
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialCommunityIcons name="information-outline" size={16} color="#ad89dc" />
            <Text className="font-reem text-xs uppercase tracking-wider text-text-secondary">
              What's included
            </Text>
          </View>
          <Text className="font-plein text-sm leading-6 text-text-muted">
            A summary of your migraines, a breakdown by cycle phase, your most common symptoms and triggers, and a full log of every attack with symptoms, triggers, and medications.
          </Text>
        </View>

        {/* Share button */}
        <View className="mx-6">
          <Pressable
            onPress={handleShare}
            disabled={generating || !hasLogs}
            className={`flex-row items-center justify-center gap-2 rounded-full py-4 active:opacity-80 ${
              generating || !hasLogs ? 'bg-elevated' : 'bg-brand'
            }`}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#ad89dc" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="share-variant"
                  size={18}
                  color={hasLogs ? '#11081b' : '#ad89dc'}
                />
                <Text
                  className={`font-plein-medium text-base ${
                    hasLogs ? 'text-text-inverse' : 'text-text-muted'
                  }`}
                >
                  Share PDF
                </Text>
              </>
            )}
          </Pressable>

          <Text className="mt-3 text-center font-plein text-xs text-text-muted">
            Save it to your device, email it to a healthcare professional, or print it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}