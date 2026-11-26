import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function ToggleRow({
  label,
  subtitle,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onChange}
      disabled={disabled}
      className={`flex-row items-center justify-between px-5 py-4 ${
        disabled ? 'opacity-40' : 'active:opacity-70'
      }`}
    >
      <View className="flex-1 pr-4">
        <Text className="font-plein-medium text-base text-text-primary">
          {label}
        </Text>
        {subtitle && (
          <Text className="mt-1 font-plein text-sm leading-5 text-text-muted">
            {subtitle}
          </Text>
        )}
      </View>

      <View
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: value ? '#ad89dc' : '#2f174f',
          position: 'relative',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#f1ebf9',
            top: 4,
            left: value ? 24 : 4,
          }}
        />
      </View>
    </Pressable>
  );
}