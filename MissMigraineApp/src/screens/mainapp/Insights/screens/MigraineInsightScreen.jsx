import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';

import { useMigraineLogs } from '../../../../hooks/useMigraineLogs';
import { useMigraineInsights } from '../hooks/useMigraineInsights';
import RangeChips from '../components/RangeChips';

// ─────────────────────────────────────────────────────
// Small reusable pieces
// ─────────────────────────────────────────────────────

function Stat({ value, label, unit }) {
  return (
    <View className="flex-1 items-center justify-center px-1">
      <View className="flex-row items-baseline">
        <Text className="font-reem text-3xl text-text-primary">{value}</Text>
        {unit && <Text className="ml-0.5 font-plein-medium text-sm text-text-muted">{unit}</Text>}
      </View>
      <Text className="mt-1 text-center font-plein text-sm text-text-muted">{label}</Text>
    </View>
  );
}

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

// ─────────────────────────────────────────────────────
// Intensity ring
// ─────────────────────────────────────────────────────

function IntensityRing({ mild, moderate, severe, total }) {
  const size = 200;
  const radius = size / 2;
  const strokeWidth = 28;
  const circleRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * circleRadius;

  const segments = [
    { count: mild, color: '#6ca45b', label: 'Mild' },
    { count: moderate, color: '#ffe162', label: 'Moderate' },
    { count: severe, color: '#a01717', label: 'Severe' },
  ].filter((s) => s.count > 0);

  if (total === 0) {
    return (
      <View className="items-center py-6">
        <Text className="font-plein text-sm text-text-muted">No migraines in this period.</Text>
      </View>
    );
  }

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const arc = (seg.count / total) * circumference;
    const dashoffset = -cumulative;
    cumulative += arc;
    return { ...seg, arc, dashoffset };
  });

  return (
    <View className="items-center">
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${radius}, ${radius}`}>
            <Circle cx={radius} cy={radius} r={circleRadius} stroke="#2f174f" strokeWidth={strokeWidth} fill="transparent" />
            {arcs.map((arc, i) => (
              <Circle
                key={i}
                cx={radius}
                cy={radius}
                r={circleRadius}
                stroke={arc.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${arc.arc} ${circumference}`}
                strokeDashoffset={arc.dashoffset}
                strokeLinecap="butt"
              />
            ))}
          </G>
        </Svg>

        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text className="font-reem text-4xl text-text-primary">{total}</Text>
          <Text className="font-plein text-sm text-text-muted">
            {total === 1 ? 'migraine' : 'migraines'}
          </Text>
        </View>
      </View>

      <View className="mt-5 w-full gap-2">
        {segments.map((seg) => {
          const percent = Math.round((seg.count / total) * 100);
          return (
            <View key={seg.label} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: seg.color }} />
                <Text className="font-plein text-sm text-text-secondary">{seg.label}</Text>
              </View>
              <Text className="font-plein-medium text-sm text-text-primary">
                {seg.count} ― {percent}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Ranked bar (used for both symptoms and triggers)
// ─────────────────────────────────────────────────────

function RankedBar({ name, count, maxCount, color = '#ad89dc' }) {
  const pct = Math.round((count / maxCount) * 100);
  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 pr-3 font-plein-medium text-base text-text-primary" numberOfLines={1}>
          {name}
        </Text>
        <Text className="font-plein-medium text-sm text-text-muted">{count}</Text>
      </View>
      <View className="mb-2 h-2 w-full overflow-hidden rounded-full bg-elevated">
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function MigraineInsightScreen({ navigation }) {
  const { logs } = useMigraineLogs();
  const [range, setRange] = useState('month');
  const insights = useMigraineInsights(range, logs);

  const { mild, moderate, severe } = useMemo(() => {
    const s = insights.severity || [];
    return {
      mild: s.find((r) => r.key === 'mild')?.count ?? 0,
      moderate: s.find((r) => r.key === 'moderate')?.count ?? 0,
      severe: s.find((r) => r.key === 'severe')?.count ?? 0,
    };
  }, [insights.severity]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="mb-4">
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#f1ebf9"
              onPress={() => navigation.goBack()}
            />
          </View>
          <Text className="font-reem text-4xl text-text-primary">Migraine overview</Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Personalised patterns from your data
          </Text>
        </View>

        <View className="mb-6">
          <RangeChips value={range} onChange={setRange} />
        </View>

        {insights.count === 0 && logs.length === 0 ? (
          <View className="mx-6 rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
            <MaterialCommunityIcons name="chart-line" size={32} color="#ad89dc" style={{ marginBottom: 12 }} />
            <Text className="text-center font-plein-medium text-base text-text-primary mb-1">
              No migraines logged yet
            </Text>
            <Text className="text-center font-plein text-sm text-text-muted">
              Log your first migraine to see insights here.
            </Text>
          </View>
        ) : (
          <>
            <Section title="Summary">
              <View className="flex-row items-center">
                <Stat value={insights.avgIntensity} label="avg pain" />
                <View className="w-[2px] h-10 bg-elevated" />
                <Stat value={insights.avgDuration} label="avg duration" unit="h" />
                <View className="w-[2px] h-10 bg-elevated" />
                <Stat value={insights.auraPercent} label="with aura" unit="%" />
              </View>
            </Section>

            <Section title="Intensity distribution">
              <IntensityRing mild={mild} moderate={moderate} severe={severe} total={insights.count} />
            </Section>

            <Section title="Top symptoms">
              {insights.symptoms.length === 0 ? (
                <Text className="py-2 font-plein text-sm text-text-muted">
                  No symptoms recorded in this period.
                </Text>
              ) : (
                <View className="gap-5">
                  {insights.symptoms.map((symptom) => (
                    <RankedBar
                      key={symptom.name}
                      name={symptom.name}
                      count={symptom.value}
                      maxCount={insights.maxSymptomCount}
                    />
                  ))}
                </View>
              )}
            </Section>

            <Section title="Top triggers">
              {insights.triggers.length === 0 ? (
                <Text className="py-2 font-plein text-sm text-text-muted">
                  No triggers logged in this period.
                </Text>
              ) : (
                <View className="gap-5">
                  {insights.triggers.map((trigger) => (
                    <RankedBar
                      key={trigger.name}
                      name={trigger.name}
                      count={trigger.value}
                      maxCount={insights.maxTriggerCount}
                      color="#e07a9a"
                    />
                  ))}
                </View>
              )}
            </Section>

            {/* Severe migraine callout */}
            {insights.severeCount > 0 && (
              <View className="mb-6">
                <View className="mb-3 px-6">
                  <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
                    During severe migraines
                  </Text>
                </View>
                <View className="mx-6 rounded-[24px] bg-brand-dark/40 p-5">
                  <View className="mb-3 flex-row items-center gap-2">
                    <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#c8b0e8" />
                    <Text className="font-reem text-xs uppercase tracking-wider text-brand-light">
                      {insights.severeCount} severe migraine{insights.severeCount === 1 ? '' : 's'}
                    </Text>
                  </View>

                  {insights.topSevereSymptom && (
                    <View className="mb-3 flex-row items-baseline gap-2">
                      <Text className="font-plein text-base text-text-primary">
                        Top symptom:
                      </Text>
                      <Text className="font-plein-medium text-base text-brand-light">
                        {insights.topSevereSymptom.name}
                      </Text>
                      <Text className="font-plein text-sm text-text-muted">
                        ({insights.topSevereSymptom.value} of {insights.severeCount})
                      </Text>
                    </View>
                  )}

                  {insights.topSevereTrigger && (
                    <View className="flex-row items-baseline gap-2">
                      <Text className="font-plein text-base text-text-primary">
                        Top trigger:
                      </Text>
                      <Text className="font-plein-medium text-base text-brand-light">
                        {insights.topSevereTrigger.name}
                      </Text>
                      <Text className="font-plein text-sm text-text-muted">
                        ({insights.topSevereTrigger.value} of {insights.severeCount})
                      </Text>
                    </View>
                  )}

                  {!insights.topSevereSymptom && !insights.topSevereTrigger && (
                    <Text className="font-plein text-sm text-text-muted">
                      No symptoms or triggers recorded during your severe migraines.
                    </Text>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}