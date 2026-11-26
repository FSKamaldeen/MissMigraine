import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  variant = 'default',
  showChevron = true,
}) {
  const isDanger = variant === 'danger';
  const iconColor = isDanger ? '#a01717' : '#ad89dc';
  const labelColor = isDanger ? 'text-danger' : 'text-text-primary';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 px-5 py-4 active:opacity-60"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-elevated">
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>

      <View className="flex-1">
        <Text className={`font-plein-medium text-base ${labelColor}`}>
          {label}
        </Text>
        {subtitle && (
          <Text className="mt-1 font-plein text-sm text-text-muted">
            {subtitle}
          </Text>
        )}
      </View>

      {showChevron && (
        <MaterialCommunityIcons name="chevron-right" size={20} color={iconColor} />
      )}
    </Pressable>
  );
}