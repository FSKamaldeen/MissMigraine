import React from 'react';
import { Text, View } from 'react-native';

export default function SettingsSection({ title, children }) {
  return (
    <View className="mb-6">
      {title && (
        <View className="mb-3 px-6">
          <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
            {title}
          </Text>
        </View>
      )}
      <View className="mx-6 rounded-[24px] bg-surface overflow-hidden">
        {children}
      </View>
    </View>
  );
}