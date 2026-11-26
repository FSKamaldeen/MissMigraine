import React from 'react';
import { Pressable, Text } from 'react-native';

export default function OptionChip({
  label,
  selected = false,
  onPress,
  size = 'md',
  style,
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border-[1.5px] ${sizeClasses[size]} ${
        selected
          ? 'border-brand-light bg-brand-dark/30'
          : 'border-outline bg-surface'
      }`}
      style={style}
    >
      <Text
        className={`font-plein-medium ${textSizeClasses[size]} ${
          selected ? 'text-text-primary' : 'text-text-secondary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}