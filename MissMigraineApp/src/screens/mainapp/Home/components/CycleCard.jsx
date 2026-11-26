import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CYCLE_PHASE_META } from '../../../../constants/colors';

export default function CycleCard({ cycleSummary, onPress }) {
  // Empty State
  if (!cycleSummary) {
    return (
      <View className="mb-6 px-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
            Your cycle
          </Text>
        </View>
        <Pressable
          onPress={onPress}
          className="rounded-3xl border-[1.5px] border-dashed border-border bg-surface p-6 active:opacity-70"
        >
          <MaterialCommunityIcons
            name="calendar-heart"
            size={32}
            color="#ad89dc"
            style={{ alignSelf: 'center', marginBottom: 12 }}
          />
          <Text className="mb-1 text-center font-plein-medium text-base text-text-primary">
            Set up your cycle
          </Text>
          <Text className="text-center font-plein text-sm text-text-muted">
            Track your phases to see how they connect to your migraines.
          </Text>
        </Pressable>
      </View>
    );
  }

  // With Data
  const { phaseKey, dayInCycle, cycleLength, nextPeriodDate, segments } = cycleSummary;
  const phase = CYCLE_PHASE_META[phaseKey] || CYCLE_PHASE_META.luteal;

  // Calculate days until next period
  const daysUntilPeriod = nextPeriodDate
    ? Math.ceil((new Date(nextPeriodDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate the exact percentage position of today in the cycle
  const markerPosition = Math.min(Math.max((dayInCycle / cycleLength) * 100, 0), 100);

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="mb-3 flex-row items-center justify-between px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          Your cycle
        </Text>
      </View>

      {/* Main Hero Card */}
      <View className="mx-6 rounded-[32px] bg-surface p-6">
        
        {/* Phase Title & Day */}
        <View className="items-center mb-6 mt-2">
          <Text 
            className="font-reem text-4xl mb-1" 
            style={{ color: phase.color }}
          >
            {phase.fullName}
          </Text>
          <Text className="font-plein-medium text-base text-text-secondary">
            Day {dayInCycle} of {cycleLength}
          </Text>
        </View>

        {/* Timeline with Today Marker */}
        <View className="mb-10 relative">
          {/* The colored bar */}
          <View className="h-3 flex-row overflow-hidden rounded-full bg-elevated">
            {segments.map((segment) => (
              <View
                key={segment.key}
                style={{
                  flex: segment.length,
                  backgroundColor: CYCLE_PHASE_META[segment.key].color,
                }}
              />
            ))}
          </View>

          {/* The Today Marker */}
          <View 
            className="absolute top-0 items-center" 
            style={{ left: `${markerPosition}%`, marginLeft: -8, width: 16 }}
          >
            <View className="h-3 w-3 rounded-full bg-text-primary z-10 shadow-sm" />
          </View>

          {/* Labels under the timeline */}
          <View className="flex-row justify-between mt-2 px-1">
             <Text className="font-plein text-sm text-text-muted">Start</Text>
             <Text className="font-plein text-sm text-text-muted text-right">
               {daysUntilPeriod === 0 ? "Period expected today" : `Next period in ${daysUntilPeriod} days`}
             </Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          
          {/* Left Card: About Today */}
          <View className="flex-1 rounded-2xl bg-elevated p-4 justify-between">
            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-background">
                  <MaterialCommunityIcons name="information-outline" size={14} color="#c8b0e8" />
                </View>
                <Text className="font-plein-medium text-sm text-text-primary">
                  About Today
                </Text>
              </View>
              <Text className="font-plein text-sm text-text-muted leading-5" >
                {phaseKey === 'menstrual' && "Estrogen and progesterone are at their lowest."}
                {phaseKey === 'follicular' && "Estrogen is rising, bringing renewed energy."}
                {phaseKey === 'ovulatory' && "Estrogen peaks, often bringing high energy."}
                {phaseKey === 'luteal' && "Progesterone rises as your body prepares."}
              </Text>
            </View>
          </View>

          {/* Right Card: View Detailed */}
          <Pressable 
            onPress={onPress}
            className="flex-1 rounded-2xl p-4 active:opacity-70 justify-center"
            style={{ backgroundColor: `${phase.color}22` }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-background/50">
                <MaterialCommunityIcons name="arrow-right" size={14} color="#c8b0e8" />
              </View>
              <Text className="font-plein-medium text-sm text-text-primary">
                View Cycle
              </Text>
            </View>
            <Text className="font-plein text-sm text-text-muted leading-5">
              Tap here to see your detailed cycle breakdown and calendar.
            </Text>
          </Pressable>

        </View>
      </View>
    </View>
  );
}