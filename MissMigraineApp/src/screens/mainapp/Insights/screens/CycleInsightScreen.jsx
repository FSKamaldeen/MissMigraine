import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useMigraineLogs } from '../../../../hooks/useMigraineLogs';
import { useCycleData } from '../../../../hooks/useCycleData';

import RangeChips from '../components/RangeChips';
import { useCycleCorrelation } from '../hooks/useCycleCorrelation';

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function DisclaimerBanner() {
  return (
    <View className="mx-6 mb-6 flex-row items-start gap-2 rounded-2xl bg-surface px-4 py-3">
      <MaterialCommunityIcons
        name="information-outline"
        size={16}
        color="#ad89dc"
        style={{ marginTop: 1 }}
      />
      <Text className="flex-1 font-plein text-sm leading-5 text-text-muted">
        These insights come from your own logs and aren't medical advice.
      </Text>
    </View>
  );
}

function VerdictBanner({ verdict }) {
  const isNeutral = verdict.tone === 'neutral';

  return (
    <View
      className={`mx-6 mb-6 rounded-[24px] p-5 ${
        isNeutral ? 'bg-surface' : 'bg-brand-dark/40'
      }`}
    >
      <View className="mb-3 flex-row items-center gap-2">
        <MaterialCommunityIcons
          name={verdict.icon}
          size={20}
          color={isNeutral ? '#ad89dc' : '#c8b0e8'}
        />
        <Text
          className={`font-reem text-xs uppercase tracking-wider ${
            isNeutral ? 'text-text-muted' : 'text-brand-light'
          }`}
        >
          {verdict.label}
        </Text>
      </View>
      <Text className="font-plein text-base leading-6 text-text-primary">
        {verdict.level === 'insufficient' &&
          'We need a few more migraines logged to look for cycle patterns.'}
        {verdict.level === 'none' &&
          'Your migraines seem fairly evenly spread across your cycle.'}
        {verdict.level === 'subtle' &&
          'Your migraines show a slight tendency toward one phase. More data will help clarify.'}
        {verdict.level === 'possible' &&
          'There may be a link between your cycle and your migraines.'}
        {verdict.level === 'notice' &&
          "More migraines appeared around your period than we'd expect by chance."}
      </Text>
    </View>
  );
}

function PhaseChart({ phaseStats, topPhaseKey }) {
  const maxCount = Math.max(...phaseStats.map((p) => p.count), 1);
  const avgCount =
    phaseStats.reduce((s, p) => s + p.count, 0) / phaseStats.length;

  return (
    <View>
      <View
        style={{
          height: 160,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 24,
        }}
      >
        {phaseStats.map((phase) => {
          const heightPct = (phase.count / maxCount) * 100;
          const isTop = phase.key === topPhaseKey;

          return (
            <View
              key={phase.key}
              style={{
                flex: 1,
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <Text
                className={`mb-1 font-plein-medium text-base ${
                  isTop ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {phase.count}
              </Text>
              <View
                style={{
                  width: 24,
                  height: `${heightPct}%`,
                  minHeight: 6,
                  backgroundColor: phase.color,
                  borderRadius: 12,
                  opacity: isTop ? 1 : 0.55,
                }}
              />
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 24, marginTop: 8 }}>
        {phaseStats.map((phase) => (
          <View key={phase.key} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              className={`font-plein text-sm ${
                phase.key === topPhaseKey
                  ? 'text-text-primary'
                  : 'text-text-muted'
              }`}
              numberOfLines={1}
            >
              {phase.label}
            </Text>
          </View>
        ))}
      </View>

      <Text className="mt-4 text-center font-plein text-xs text-text-muted">
        Expected if no cycle link: ~{Math.round(avgCount)} per phase
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function CycleInsightScreen({ navigation }) {
  const { logs } = useMigraineLogs();
  const { cycleData } = useCycleData();
  const [range, setRange] = useState('3m');
  const insights = useCycleCorrelation(range, logs, cycleData);

  // No cycle data
  if (!insights.hasCycleData) {
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
              Cycle & migraine
            </Text>
          </View>

          <View className="mx-6 items-center rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6">
            <MaterialCommunityIcons
              name="calendar-heart"
              size={32}
              color="#ad89dc"
              style={{ marginBottom: 12 }}
            />
            <Text className="mb-1 text-center font-plein-medium text-base text-text-primary">
              Set up your cycle first
            </Text>
            <Text className="mb-5 text-center font-plein text-sm text-text-muted">
              Add your last period date to look for patterns between your cycle and your migraines.
            </Text>
            <Pressable
              onPress={() =>
                navigation.navigate('HomeTab', { screen: 'CycleTracker' })
              }
              className="items-center rounded-full bg-brand px-6 py-3 active:bg-brand-dark"
            >
              <Text className="font-plein-medium text-sm text-text-inverse">
                Set up cycle
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          <Text className="font-reem text-4xl text-text-primary">
            Cycle & migraine
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Based on your logs from {insights.rangeLabel.toLowerCase()}
          </Text>
        </View>

        {/* Range chips */}
        <View className="mb-6">
          <RangeChips value={range} onChange={setRange} />
        </View>

        <DisclaimerBanner />

        {/* Chart */}
        {insights.totalLogs > 0 && (
          <View className="mb-6">
            <View className="mb-3 px-6">
              <Text className="mt-2 font-reem text-xs uppercase tracking-wider text-text-muted">
                Migraines by cycle phase
              </Text>
              <Text className="mt-1 font-plein text-sm text-text-secondary">
                {insights.rangeLabel} ― {insights.totalLogs} migraine
                {insights.totalLogs === 1 ? '' : 's'}
              </Text>
            </View>
            <View className="mx-6 rounded-[24px] bg-surface p-5 pt-10">
              <PhaseChart
                phaseStats={insights.phaseStats}
                topPhaseKey={insights.topPhase?.key}
              />
            </View>
          </View>
        )}

        <VerdictBanner verdict={insights.verdict} />
      </ScrollView>
    </SafeAreaView>
  );
}