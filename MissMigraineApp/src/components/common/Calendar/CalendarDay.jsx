import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function CalendarDay({
  date,
  isCurrentMonth,
  isSelected,
  isRangeStart,
  isRangeEnd,
  isInRange,
  isToday,
  isDisabled,
  hasMarker,
  onPress,
}) {
  // Determine styling based on state
  const isEndpoint = isRangeStart || isRangeEnd;

  const circleClass = isEndpoint
    ? 'bg-brand'
    : isSelected
    ? 'bg-brand'
    : '';

  const textClass = isEndpoint || isSelected
    ? 'text-text-inverse'
    : isDisabled
    ? 'text-text-muted'
    : !isCurrentMonth
    ? 'text-text-muted'
    : isToday
    ? 'text-brand-light'
    : 'text-text-primary';

  const opacityClass = isDisabled || !isCurrentMonth ? 'opacity-40' : '';

  const rangeBgClass = isInRange ? 'bg-brand-dark/30' : '';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className="flex-1 items-center py-1"
    >
      <View
        className={`h-10 w-full items-center justify-center ${rangeBgClass}`}
      >
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${circleClass}`}
        >
          <Text className={`font-plein-medium text-sm ${textClass} ${opacityClass}`}>
            {date.getDate()}
          </Text>
        </View>

        {hasMarker && !isEndpoint && !isSelected && (
          <View
            className="absolute bottom-0 h-1 w-1 rounded-full"
            style={{ backgroundColor: '#ad89dc' }}
          />
        )}
      </View>
    </Pressable>
  );
}