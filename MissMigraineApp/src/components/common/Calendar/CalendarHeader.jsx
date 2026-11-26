import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CalendarHeader({
  monthLabel,
  onPrev,
  onNext,
  canGoPrev = true,
  canGoNext = true,
}) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Pressable
        onPress={onPrev}
        disabled={!canGoPrev}
        hitSlop={10}
        className="p-2"
      >
        <MaterialCommunityIcons
          name="chevron-left"
          size={28}
          color={canGoPrev ? '#f1ebf9' : '#472376'}
        />
      </Pressable>

      <Text className="font-plein-medium text-lg text-text-primary">
        {monthLabel}
      </Text>

      <Pressable
        onPress={onNext}
        disabled={!canGoNext}
        hitSlop={10}
        className="p-2"
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={28}
          color={canGoNext ? '#f1ebf9' : '#472376'}
        />
      </Pressable>
    </View>
  );
}