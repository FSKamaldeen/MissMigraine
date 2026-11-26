import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { RANGE_OPTIONS } from '../hooks/useMigraineInsights';

export default function RangeChips({ value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 24, paddingBottom: 4 }}
    >
      {RANGE_OPTIONS.map((option) => {
        const isActive = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            className={`rounded-full px-4 py-2 ${
              isActive ? 'bg-brand' : 'bg-surface'
            }`}
          >
            <Text
              className={`font-plein-medium text-sm ${
                isActive ? 'text-text-inverse' : 'text-text-secondary'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}