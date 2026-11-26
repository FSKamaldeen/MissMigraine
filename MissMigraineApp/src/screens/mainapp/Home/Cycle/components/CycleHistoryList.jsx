import React from 'react';
import { Text, View } from 'react-native';
import { formatLongDate } from '../../../../../utils/dateUtils';
import EmptyState from '../../../../../components/common/EmptyState';

export default function CycleHistoryList({ entries }) {
  return (
    <View className="mx-6 mb-4 rounded-3xl border-[1.5px] border-outline bg-surface p-5">
      <Text className="mb-1 font-plein-medium text-xs uppercase tracking-wider text-text-muted">
        Cycle history
      </Text>
      <Text className="mb-4 font-plein text-xs text-text-muted">
        Recent cycles saved on this device.
      </Text>

      {!entries || entries.length === 0 ? (
        <EmptyState
          icon="calendar-blank-outline"
          title="No cycles yet"
          subtitle="Save a cycle above to start building your history."
        />
      ) : (
        <View className="gap-3">
          {entries.map((entry) => (
            <View
              key={entry.id}
              className="rounded-2xl border border-outline bg-elevated p-3.5"
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-plein-medium text-sm text-text-primary">
                  {formatLongDate(entry.periodStart)}
                </Text>
                <View className="rounded-full bg-brand/20 px-2.5 py-1">
                  <Text className="font-plein-medium text-xs text-brand-light">
                    {entry.cycleLength} days
                  </Text>
                </View>
              </View>
              <Text className="font-plein text-xs text-text-muted">
                End: {entry.periodEnd ? formatLongDate(entry.periodEnd) : 'Not set'}
              </Text>
              <Text className="mt-1 font-plein text-xs text-text-muted">
                Ovulation: Day {entry.ovulationDay || '—'}
              </Text>
              {entry.notes ? (
                <Text className="mt-1 font-plein text-xs text-text-muted">
                  {entry.notes}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}