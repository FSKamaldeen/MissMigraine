import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ChoiceRow({
  label,
  options,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <View className={`px-5 py-4 ${disabled ? 'opacity-40' : ''}`}>
      <Text className="mb-3 font-plein-medium text-sm text-text-secondary">
        {label}
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const optionValue =
            typeof option === 'string' ? option : option.value;
          const optionLabel =
            typeof option === 'string' ? option : option.label;
          const isActive = value === optionValue;

          return (
            <Pressable
              key={optionValue}
              onPress={disabled ? undefined : () => onChange(optionValue)}
              className={`rounded-full px-4 py-2.5 active:opacity-70 ${
                isActive ? 'bg-brand' : 'bg-elevated'
              }`}
            >
              <Text
                className={`font-plein-medium text-sm ${
                  isActive ? 'text-text-inverse' : 'text-text-secondary'
                }`}
              >
                {optionLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}