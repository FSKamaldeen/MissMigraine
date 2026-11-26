import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

function Stat({ value, label }) {
  return (
    <View className="flex-1 items-center justify-center px-1">
      <Text className="font-reem text-3xl text-text-primary">{value}</Text>
      <Text className="mt-1 text-center font-plein text-sm text-text-muted">
        {label}
      </Text>
    </View>
  );
}

export default function WeeklyStats({ logs }) {
  const { count, avgIntensity, daysSinceLast, lastMigraineLabel } = useMemo(() => {
    // Use the actual field name returned by useMigraineLogs (camelCase).
    const safeLogs = (logs || []).filter((l) => l?.dateTime);

    // ─── Start of this week (Monday, local midnight) ───
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const toLocalMidnight = (input) => {
      const d = new Date(input);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    // ─── This week only (for count + avg intensity) ───
    const weekLogs = safeLogs.filter(
      (l) => toLocalMidnight(l.dateTime) >= startOfWeek
    );
    const weekCount = weekLogs.length;

    const weekAvgIntensity = weekCount
      ? (weekLogs.reduce((s, l) => s + (l.intensity || 0), 0) / weekCount).toFixed(1)
      : '―';

    // ─── Days since last migraine (all logs, no week limit) ───
    let days = '―';
    if (safeLogs.length > 0) {
      const sorted = [...safeLogs].sort(
        (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
      );
      const lastLogLocal = toLocalMidnight(sorted[0].dateTime);
      const todayLocal = toLocalMidnight(new Date());

      const diffMs = todayLocal - lastLogLocal;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) days = 'Today';
      else if (diffDays === 1) days = '1';
      else days = `${diffDays}`;
    }

    return {
      count: weekCount,
      avgIntensity: weekAvgIntensity,
      daysSinceLast: days,
      lastMigraineLabel: days === 'Today' ? 'Last Migraine' : 'Days since last',
    };
  }, [logs]);

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          This week
        </Text>
      </View>

      <View className="mx-6 rounded-[24px] bg-surface p-2">
        <View className="flex-row items-center">
          <View className="flex-1 py-4">
            <Stat value={count} label="Migraines" />
          </View>

          <View className="w-[2px] h-10 bg-elevated" />

          <View className="flex-1 py-4">
            <Stat value={avgIntensity} label="Intensity" />
          </View>

          <View className="w-[2px] h-10 bg-elevated" />

          <View className="flex-1 py-4">
            <Stat value={daysSinceLast} label={lastMigraineLabel} />
          </View>
        </View>
      </View>
    </View>
  );
}