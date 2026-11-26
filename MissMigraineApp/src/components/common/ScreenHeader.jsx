import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScreenHeader({
  onBack,
  title,
  subtitle,
  rightAction,
}) {
  return (
    <View className="relative px-6 pt-14 pb-6">
      {/* Back arrow */}
      {onBack && (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="absolute top-4 left-4 z-10 p-2"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#f1ebf9"
          />
        </Pressable>
      )}

      {/* Right action — optional */}
      {rightAction && (
        <View className="absolute top-4 right-4 z-10">
          {rightAction}
        </View>
      )}

      {/* Title block */}
      {title && (
        <View className="mt-4">
          <Text
            className="font-reem text-3xl text-text-primary"
            style={{ lineHeight: 40 }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="mt-1 font-plein text-base text-text-muted">
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}