import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function InsightCard({
  title,
  description,
  icon,
  bgColor,
  accentColor,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center overflow-hidden rounded-3xl active:opacity-90"
      style={{
        backgroundColor: bgColor,
        height: 96,
        paddingLeft: 20,
        paddingRight: 16,
      }}
    >
      {/* Text block */}
      <View className="flex-1 pr-3">
        <Text
          className="font-reem text-lg"
          style={{ color: accentColor, lineHeight: 24 }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="mt-1 font-plein text-sm"
          style={{ color: accentColor, opacity: 0.75 }}
          numberOfLines={1}
        >
          {description}
        </Text>
      </View>

      {/* Illustration block */}
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${accentColor}22` }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={30}
          color={accentColor}
        />
      </View>
    </Pressable>
  );
}