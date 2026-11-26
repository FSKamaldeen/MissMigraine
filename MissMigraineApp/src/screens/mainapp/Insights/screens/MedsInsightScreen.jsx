import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useMigraineLogs } from '../../../../hooks/useMigraineLogs';
import { useMedicationInsights } from '../hooks/useMedicationInsights';
import RangeChips from '../components/RangeChips';

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <View className="mb-6">
      <View className="mb-3 px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          {title}
        </Text>
        {subtitle && (
          <Text className="mt-1 font-plein text-sm text-text-secondary">{subtitle}</Text>
        )}
      </View>
      <View className="mx-6 rounded-[24px] bg-surface p-5">{children}</View>
    </View>
  );
}

function SummaryBanner({ totalLogs, logsWithMedsCount, rangeLabel }) {
  const summaryText =
    totalLogs === 0
      ? 'No migraines logged in this period.'
      : logsWithMedsCount === 0
      ? "You haven't logged any medications in this period."
      : `You took medication in ${logsWithMedsCount} of ${totalLogs} migraine${
          totalLogs === 1 ? '' : 's'
        }.`;

  return (
    <View className="mx-6 mb-6 rounded-[24px] bg-brand-dark/40 p-5">
      <View className="mb-3 flex-row items-center gap-2">
        <MaterialCommunityIcons name="pill" size={20} color="#c8b0e8" />
        <Text className="font-reem text-xs uppercase tracking-wider text-brand-light">
          Medication summary
        </Text>
      </View>
      <Text className="font-plein text-base leading-6 text-text-primary">
        {summaryText}
      </Text>
    </View>
  );
}

function UsageBar({ name, count, maxCount }) {
  const pct = Math.round((count / maxCount) * 100);
  return (
    <View className="mt-5 first:mt-0">
      <Text
        className="mb-2 font-plein-medium text-base text-text-primary"
        numberOfLines={1}
      >
        {name}
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: '#ad89dc',
              borderRadius: 999,
            }}
          />
        </View>
        <Text className="w-8 text-right font-plein-medium text-base text-text-secondary">
          {count}
        </Text>
      </View>
    </View>
  );
}

function DurationRow({ label, hours, maxHours, color }) {
  const pct = Math.round((hours / maxHours) * 100);
  return (
    <View className="mt-5 first:mt-0">
      <Text className="mb-2 font-plein-medium text-base text-text-primary">
        {label}
      </Text>
      <View className="flex-row items-center gap-3">
        <View className="h-2.5 flex-1 overflow-hidden rounded-full bg-elevated">
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: 999,
            }}
          />
        </View>
        <Text className="w-14 text-right font-plein-medium text-base text-text-secondary">
          {hours}h
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function MedsInsightScreen({ navigation }) {
  const { logs } = useMigraineLogs();
  const [range, setRange] = useState('3m');
  const insights = useMedicationInsights(range, logs);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            className="mb-4 self-start"
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">Medications</Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Based on your logs from {insights.rangeLabel.toLowerCase()}
          </Text>
        </View>

        {/* Range chips */}
        <View className="mb-6">
          <RangeChips value={range} onChange={setRange} />
        </View>

        {insights.totalLogs === 0 ? (
          <View className="mx-6 items-center rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6">
            <MaterialCommunityIcons
              name="pill"
              size={32}
              color="#ad89dc"
              style={{ marginBottom: 12 }}
            />
            <Text className="mb-1 text-center font-plein-medium text-base text-text-primary">
              No migraines logged in this period
            </Text>
            <Text className="text-center font-plein text-sm text-text-muted">
              Try a wider range, or log a migraine to see medication patterns.
            </Text>
          </View>
        ) : (
          <>
            <SummaryBanner
              totalLogs={insights.totalLogs}
              logsWithMedsCount={insights.logsWithMedsCount}
              rangeLabel={insights.rangeLabel}
            />

            {/* Usage */}
            <Section
              title="Usage"
              subtitle={
                insights.logsWithMedsCount > 0
                  ? `Across ${insights.logsWithMedsCount} migraine${
                      insights.logsWithMedsCount === 1 ? '' : 's'
                    } where you took something`
                  : undefined
              }
            >
              {insights.medications.length === 0 ? (
                <Text className="py-2 font-plein text-base text-text-muted">
                  No medications logged in this period.
                </Text>
              ) : (
                insights.medications.map((med) => (
                  <UsageBar
                    key={med.name}
                    name={med.name}
                    count={med.count}
                    maxCount={insights.maxUsage}
                  />
                ))
              )}
            </Section>

            {/* Duration */}
            <Section
              title="Duration with vs without"
              subtitle="Average attack length depending on whether you took medication."
            >
              {!insights.hasDurationData ? (
                <Text className="py-2 font-plein text-base text-text-muted">
                  Not enough duration data yet. Keep logging to see this comparison.
                </Text>
              ) : (
                <>
                  <DurationRow
                    label="With medication"
                    hours={insights.durationWithMeds}
                    maxHours={insights.maxDuration}
                    color="#ad89dc"
                  />
                  <DurationRow
                    label="Without medication"
                    hours={insights.durationWithoutMeds}
                    maxHours={insights.maxDuration}
                    color="#c8b0e8"
                  />
                  {insights.durationInsight && (
                    <Text className="mt-4 font-plein text-sm leading-6 text-text-secondary">
                      {insights.durationInsight}
                    </Text>
                  )}
                </>
              )}
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}