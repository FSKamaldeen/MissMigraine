import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import { useLogDraft } from '../LogDraftContext';

function getIntensityColor(value) {
  if (value <= 3) return '#6ca45b';
  if (value <= 6) return '#ffe162';
  return '#a01717';
}

export default function LogIntensityStep({ navigation, route }) {
  const { draft, updateDraft } = useLogDraft();
  const value = draft.intensity || 5;
  const color = getIntensityColor(value);

  const returnTo = route.params?.returnTo;

  const handleContinue = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.navigate('LogTimeStep');
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-1 px-8 pt-4">

        {/* Back Arrow */}
        <View className="mb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} className="self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="h-1.5 w-full mb-8 overflow-hidden rounded-full bg-elevated">
          <View
            style={{
              width: `${(1 / 6) * 100}%`,
              height: '100%',
              backgroundColor: '#ad89dc',
              borderRadius: 999,
            }}
          />
        </View>

        {/* Body */}
        <View className="flex-1">
          <View className="mt-2 mb-8">
            <Text className="font-reem text-4xl text-text-primary mb-3">
              How bad is the pain?
            </Text>
            <Text className="font-plein text-base text-text-secondary leading-6">
              Rate the intensity of your migraine right now.
            </Text>
          </View>

          <View className="flex-1 justify-center pb-12">
            <View className="items-center mb-6">
              <Text className="font-reem text-[80px]" style={{ color, lineHeight: 90 }}>
                {value}
              </Text>
              <Text className="font-plein-medium text-lg uppercase tracking-wider" style={{ color }}>
                {value <= 3 ? 'Mild' : value <= 6 ? 'Moderate' : 'Severe'}
              </Text>
            </View>

            <View className="w-full">
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={value}
                onValueChange={(val) => updateDraft({ intensity: Math.round(val) })}
                minimumTrackTintColor={color}
                maximumTrackTintColor="#2f174f"
                thumbTintColor={color}
              />
              <View className="flex-row justify-between mt-1 px-1">
                <Text className="font-plein-medium text-base text-text-muted">Mild</Text>
                <Text className="font-plein-medium text-base text-text-muted">Severe</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <View className="pb-14">
          <Pressable
            onPress={handleContinue}
            className="items-center rounded-full py-4 bg-brand active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-base text-text-inverse">
              Continue
            </Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}