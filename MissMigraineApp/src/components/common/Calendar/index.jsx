import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import CalendarHeader from './CalendarHeader';
import CalendarDay from './CalendarDay';
import {
  buildCalendarGrid,
  isBetween,
  isSameDay,
  startOfDay,
} from './utils';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Calendar({
  mode = 'single',
  value,
  rangeStart,
  rangeEnd,
  minDate,
  maxDate,
  markers = [],
  onChange,
  onCancel,
  showActions = false,   // default off now
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (mode === 'range' && rangeStart) return rangeStart;
    if (value) return value;
    return new Date();
  });

  const [internalSingle, setInternalSingle] = useState(value ?? null);
  const [internalRange, setInternalRange] = useState({
    start: rangeStart ?? null,
    end: rangeEnd ?? null,
  });

  const cells = useMemo(
    () => buildCalendarGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const monthLabel = viewDate.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const canGoPrev = true;
  const canGoNext = useMemo(() => {
    if (!maxDate) return true;
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return nextMonth <= maxMonth;
  }, [viewDate, maxDate]);

  const goPrev = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const goNext = () => {
    if (!canGoNext) return;
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isDisabled = (date) => {
    const d = startOfDay(date);
    if (minDate && d < startOfDay(minDate)) return true;
    if (maxDate && d > startOfDay(maxDate)) return true;
    return false;
  };

  const hasMarker = (date) => markers.some((m) => isSameDay(m, date));

  const handleDayPress = (date) => {
    if (isDisabled(date)) return;

    if (mode === 'single') {
      setInternalSingle(date);
      // Auto-apply immediately
      onChange?.(date);
      return;
    }

    // Range mode: start new range, or complete it
    const { start, end } = internalRange;
    if (!start || (start && end)) {
      setInternalRange({ start: date, end: null });
    } else {
      const next =
        date < start
          ? { start: date, end: start }
          : { start, end: date };
      setInternalRange(next);
      // Auto-apply when range is complete
      onChange?.(next);
    }
  };

  return (
    <View className="rounded-[32px] border-[1.5px] border-outline bg-surface p-5">
      <CalendarHeader
        monthLabel={monthLabel}
        onPrev={goPrev}
        onNext={goNext}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />

      {/* Weekday labels */}
      <View className="mb-2 flex-row">
        {WEEKDAYS.map((day, i) => (
          <View key={i} className="flex-1 items-center py-2">
            <Text className="font-plein-medium text-sm text-text-muted">
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View>
        {Array.from({ length: 6 }).map((_, rowIdx) => (
          <View key={rowIdx} className="flex-row">
            {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((cell, colIdx) => {
              const isSelected =
                mode === 'single' ? isSameDay(cell.date, internalSingle) : false;

              const isRangeStart =
                mode === 'range' && isSameDay(cell.date, internalRange.start);
              const isRangeEnd =
                mode === 'range' && isSameDay(cell.date, internalRange.end);
              const isInRange =
                mode === 'range' &&
                internalRange.start &&
                internalRange.end &&
                isBetween(cell.date, internalRange.start, internalRange.end);

              return (
                <CalendarDay
                  key={colIdx}
                  date={cell.date}
                  isCurrentMonth={cell.isCurrentMonth}
                  isSelected={isSelected}
                  isRangeStart={isRangeStart}
                  isRangeEnd={isRangeEnd}
                  isInRange={isInRange}
                  isToday={isSameDay(cell.date, new Date())}
                  isDisabled={isDisabled(cell.date)}
                  hasMarker={hasMarker(cell.date)}
                  onPress={() => handleDayPress(cell.date)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}