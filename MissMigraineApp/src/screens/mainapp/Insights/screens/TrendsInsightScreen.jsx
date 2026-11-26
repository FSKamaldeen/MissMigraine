import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useMigraineLogs } from '../../../../hooks/useMigraineLogs';
import RangeChips from '../components/RangeChips';
import { useTrendInsights } from '../hooks/useTrendInsights';

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

function SummaryBanner({ totalLogs, rangeLabel }) {
  const text =
    totalLogs === 0
      ? 'No migraines logged in this period.'
      : `You had ${totalLogs} migraine${
          totalLogs === 1 ? '' : 's'
        } ${rangeLabel.toLowerCase()}.`;

  return (
    <View className="mx-6 mb-6 rounded-[24px] bg-brand-dark/40 p-5">
      <View className="mb-3 flex-row items-center gap-2">
        <MaterialCommunityIcons
          name="chart-timeline-variant"
          size={20}
          color="#c8b0e8"
        />
        <Text className="font-reem text-xs uppercase tracking-wider text-brand-light">
          Migraine frequency
        </Text>
      </View>
      <Text className="font-plein text-base leading-6 text-text-primary">
        {text}
      </Text>
    </View>
  );
}

function FrequencyChart({ buckets, maxBucketCount }) {
  if (!buckets || buckets.length === 0) {
    return (
      <Text className="py-2 font-plein text-base text-text-muted">
        No data for this period.
      </Text>
    );
  }

  return (
    <View>
      <View
        style={{
          height: 160,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 6,
        }}
      >
        {buckets.map((bucket) => {
          const heightPct = maxBucketCount
            ? (bucket.count / maxBucketCount) * 100
            : 0;
          const isActive = bucket.count > 0;

          return (
            <View
              key={bucket.key}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
              }}
            >
              {isActive && (
                <Text className="mb-1 font-plein-medium text-xs text-text-secondary">
                  {bucket.count}
                </Text>
              )}
              <View
                style={{
                  width: 14,
                  height: `${Math.max(heightPct, isActive ? 8 : 4)}%`,
                  backgroundColor: isActive ? '#ad89dc' : '#2f174f',
                  borderRadius: 6,
                  opacity: isActive ? 1 : 0.5,
                }}
              />
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
        {buckets.map((bucket) => (
          <View key={bucket.key} style={{ flex: 1, alignItems: 'center' }}>
            <Text className="font-plein text-xs text-text-muted" numberOfLines={1}>
              {bucket.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ComparisonRow({ label, count, maxCount, color }) {
  const pct = Math.round((count / maxCount) * 100);
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
        <Text className="w-8 text-right font-plein-medium text-base text-text-secondary">
          {count}
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function TrendsInsightScreen({ navigation }) {
  const { logs } = useMigraineLogs();
  const [range, setRange] = useState('3m');
  const insights = useTrendInsights(range, logs);

  const chartTitle =
    range === '3m'
      ? 'Attacks per week'
      : range === 'year'
      ? 'Attacks per month'
      : 'Attacks per day';

  const comparisonMax = Math.max(insights.currentTotal, insights.previousTotal, 1);
  const bestIsWorst =
    insights.best && insights.worst && insights.best.key === insights.worst.key;

  // Header label from the hook
  const headerRangeLabel = insights.rangeLabel
    ? `Based on your logs ${insights.rangeLabel.toLowerCase()}`
    : 'How often your migraines happen over time';

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
            Frequency trends
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            {headerRangeLabel}
          </Text>
        </View>

        {insights.currentTotal === 0 && logs.length === 0 ? (
          <View className="mx-6 items-center rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6">
            <MaterialCommunityIcons
              name="chart-timeline-variant"
              size={32}
              color="#ad89dc"
              style={{ marginBottom: 12 }}
            />
            <Text className="mb-1 text-center font-plein-medium text-base text-text-primary">
              No migraines logged yet
            </Text>
            <Text className="text-center font-plein text-sm text-text-muted">
              Log migraines to see how often they happen over time.
            </Text>
          </View>
        ) : (
          <>
            <SummaryBanner
              totalLogs={insights.currentTotal}
              rangeLabel={insights.rangeLabel}
            />

            {/* Range chips */}
            <View className="mb-6">
              <RangeChips value={range} onChange={setRange} />
            </View>

            {/* Chart */}
            <Section title={chartTitle}>
              {insights.buckets.length > 1 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 4, minWidth: '100%' }}
                >
                  <View style={{ minWidth: 320 }}>
                    <FrequencyChart
                      buckets={insights.buckets}
                      maxBucketCount={insights.maxBucketCount}
                    />
                  </View>
                </ScrollView>
              ) : (
                <View className="items-center py-6">
                  <Text className="font-reem text-5xl text-text-primary">
                    {insights.currentTotal}
                  </Text>
                  <Text className="mt-2 font-plein text-base text-text-muted">
                    migraine{insights.currentTotal === 1 ? '' : 's'} today
                  </Text>
                </View>
              )}
            </Section>

            {/* Comparison */}
            <Section title="This period vs last">
              <ComparisonRow
                label="This period"
                count={insights.currentTotal}
                maxCount={comparisonMax}
                color="#ad89dc"
              />
              <ComparisonRow
                label="Previous period"
                count={insights.previousTotal}
                maxCount={comparisonMax}
                color="#472376"
              />
              {insights.comparisonLine && (
                <Text className="mt-4 font-plein text-sm leading-6 text-text-secondary">
                  {insights.comparisonLine}
                </Text>
              )}
            </Section>

            {/* Best & worst */}
            <Section title="Best & worst">
              {!insights.best || !insights.worst ? (
                <Text className="py-2 font-plein text-base text-text-muted">
                  Not enough data to compare {insights.bucketNoun}ly trends yet.
                </Text>
              ) : (
                <>
                  {!bestIsWorst && (
                    <>
                      <View className="mb-5 flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="mb-1 font-plein text-xs uppercase tracking-wider text-text-muted">
                            Most migraines
                          </Text>
                          <Text className="font-plein-medium text-base text-text-primary">
                            {insights.worst.label} ― {insights.worst.count} migraine
                            {insights.worst.count === 1 ? '' : 's'}
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name="trending-up"
                          size={20}
                          color="#e07a9a"
                        />
                      </View>

                      <View className="mb-5 flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="mb-1 font-plein text-xs uppercase tracking-wider text-text-muted">
                            Fewest migraines
                          </Text>
                          <Text className="font-plein-medium text-base text-text-primary">
                            {insights.best.label} ― {insights.best.count} migraine
                            {insights.best.count === 1 ? '' : 's'}
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name="trending-down"
                          size={20}
                          color="#6ca45b"
                        />
                      </View>
                    </>
                  )}

                  <Text className="font-plein text-sm leading-6 text-text-secondary">
                    Your average is {insights.average} migraine
                    {insights.average === '1.0' ? '' : 's'} per {insights.bucketNoun}.
                  </Text>
                </>
              )}
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}