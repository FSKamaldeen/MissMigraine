import React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EmptyState({
  icon = 'information-outline',
  title,
  subtitle,
}) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-elevated">
        <MaterialCommunityIcons name={icon} size={32} color="#ad89dc" />
      </View>

      {title && (
        <Text className="mb-2 text-center font-reem text-xl text-text-primary">
          {title}
        </Text>
      )}

      {subtitle && (
        <Text className="text-center font-plein text-sm leading-6 text-text-muted">
          {subtitle}
        </Text>
      )}
    </View>
  );
}