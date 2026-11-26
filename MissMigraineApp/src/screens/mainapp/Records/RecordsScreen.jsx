import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { useMigraineLogs } from '../../../hooks/useMigraineLogs';
import { toDateInputValue, formatDateTimeLabel } from '../../../utils/dateUtils';

// ─────────────────────────────────────────────────────
// Stat component
// ─────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function RecordsScreen({ navigation }) {
  const { logs, deleteLog, getMonthlyStats, refetch } = useMigraineLogs();

  const [displayMonth, setDisplayMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDateKey, setSelectedDateKey] = useState(() => {
    return toDateInputValue(new Date());
  });

  const [refreshing, setRefreshing] = useState(false);

  const monthStats = useMemo(
    () => getMonthlyStats(displayMonth),
    [getMonthlyStats, displayMonth]
  );

  const selectedDayLogs = useMemo(() => {
    if (!selectedDateKey || !logs) return [];
    return logs.filter(
      (log) => toDateInputValue(new Date(log.dateTime)) === selectedDateKey
    );
  }, [logs, selectedDateKey]);

  const loggedDatesSet = useMemo(() => {
    const set = new Set();
    (logs || []).forEach((log) => {
      set.add(toDateInputValue(new Date(log.dateTime)));
    });
    return set;
  }, [logs]);

  // Refresh whenever the screen comes into focus (e.g., after editing a log)
  useFocusEffect(
    useCallback(() => {
      if (refetch) refetch();
    }, [refetch])
  );

  const handlePullRefresh = async () => {
    setRefreshing(true);
    if (refetch) await refetch();
    setRefreshing(false);
  };

  const shiftMonth = (offset) => {
    const next = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth() + offset,
      1
    );
    setDisplayMonth(next);
  };

  const handleDeleteLog = (log) => {
    Alert.alert(
      'Delete log',
      'This migraine will be permanently removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteLog(log.id),
        },
      ]
    );
  };

  const buildCalendarGrid = (year, month) => {
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }
    return cells;
  };

  const cells = buildCalendarGrid(displayMonth.getFullYear(), displayMonth.getMonth());
  const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullRefresh}
            tintColor="#ad89dc"
            colors={['#ad89dc']}
          />
        }
      >
        <View className="px-6 pt-8 pb-6">
          <Text
            className="font-reem text-4xl text-text-primary"
            style={{ lineHeight: 48 }}
          >
            Your records
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            View and manage your migraine history
          </Text>
        </View>

        {/* Monthly Summary */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between px-6">
            <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
              {displayMonth.toLocaleDateString('en-US', { month: 'long' })} Summary
            </Text>
          </View>

          <View className="mx-6 rounded-[24px] bg-surface p-2">
            <View className="flex-row items-center">
              <View className="flex-1 py-4">
                <Stat value={monthStats.count} label="Migraines" />
              </View>
              <View className="w-[2px] h-10 bg-elevated" />
              <View className="flex-1 py-4">
                <Stat value={monthStats.avgIntensity || '0'} label="Avg intensity" />
              </View>
              <View className="w-[2px] h-10 bg-elevated" />
              <View className="flex-1 py-4">
                <Stat
                  value={monthStats.avgDuration ? `${monthStats.avgDuration}h` : '0'}
                  label="Avg duration"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between px-6">
            <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
              Calendar
            </Text>
          </View>

          <View className="mx-6 rounded-[24px] bg-surface p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} className="p-2">
                <MaterialCommunityIcons name="chevron-left" size={24} color="#f1ebf9" />
              </Pressable>
              <Text className="font-plein-medium text-base text-text-primary">
                {displayMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Pressable onPress={() => shiftMonth(1)} hitSlop={10} className="p-2">
                <MaterialCommunityIcons name="chevron-right" size={24} color="#f1ebf9" />
              </Pressable>
            </View>

            <View className="mb-2 flex-row">
              {WEEKDAYS.map((day, i) => (
                <View key={i} className="flex-1 items-center py-1">
                  <Text className="font-plein-medium text-xs text-text-muted">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View>
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <View key={rowIdx} className="flex-row">
                  {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
                    const dayKey = toDateInputValue(cell.date);
                    const hasLogs = loggedDatesSet.has(dayKey);
                    const isSelected = selectedDateKey === dayKey;
                    const isToday = dayKey === toDateInputValue(new Date());

                    return (
                      <Pressable
                        key={colIdx}
                        onPress={() => setSelectedDateKey(dayKey)}
                        className="flex-1 items-center justify-center py-1"
                      >
                        <View
                          className="h-9 w-9 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? '#ad89dc'
                              : hasLogs
                              ? '#472376'
                              : 'transparent',
                            borderWidth: isToday && !isSelected ? 1.5 : 0,
                            borderColor: '#c8b0e8',
                            opacity: cell.isCurrentMonth ? 1 : 0.3,
                          }}
                        >
                          <Text
                            className={`font-plein-medium text-sm ${
                              isSelected ? 'text-text-inverse' : 'text-text-primary'
                            }`}
                          >
                            {cell.date.getDate()}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Logs for selected date */}
        <View>
          <View className="mb-3 flex-row items-center justify-between px-6">
            <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
              Logs for{' '}
              {new Date(selectedDateKey).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View className="mx-6">
            {selectedDayLogs.length === 0 ? (
              <View className="rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={24}
                  color="#ad89dc"
                  style={{ marginBottom: 8 }}
                />
                <Text className="text-center font-plein text-sm text-text-muted">
                  No migraines logged on this day.
                </Text>
              </View>
            ) : (
              selectedDayLogs.map((log) => (
                <Pressable
                  key={log.id}
                  onPress={() => navigation.navigate('LogDetail', { logId: log.id })}
                  className="mb-3 rounded-[24px] bg-surface p-5 active:opacity-70"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View>
                      <Text className="font-plein-medium text-base text-text-primary">
                        {formatDateTimeLabel(log.dateTime).split(',')[0]}
                      </Text>
                      <Text className="font-plein text-sm text-text-muted">
                        {formatDateTimeLabel(log.dateTime).split(',')[1]}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ad89dc" />
                  </View>

                  <View className="flex-row items-center gap-4 mt-1">
                    <View className="flex-row items-center gap-1.5">
                      <MaterialCommunityIcons name="lightning-bolt" size={14} color="#e87a8e" />
                      <Text className="font-plein text-sm text-text-secondary">
                        Intensity {log.intensity}/10
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <MaterialCommunityIcons name="clock-outline" size={14} color="#c8b0e8" />
                      <Text className="font-plein text-sm text-text-secondary">
                        {log.durationHours ? `${log.durationHours}h` : 'Ongoing'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}