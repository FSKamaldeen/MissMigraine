import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLogDraft } from '../LogDraftContext';
import MultiSelectList from '../components/MultiSelectList';

const TRIGGER_OPTIONS = [
  'Stress',
  'Sleep deprivation',
  'Poor sleep quality',
  'Skipped meal',
  'Dehydration',
  'Weather change',
  'Hormonal',
  'Caffeine',
  'Alcohol',
  'Screen time',
  'Exercise',
  'Bright lights',
  'Strong smells',
  'Loud noises',
  'Travel',
  'Neck tension',
  'Anxiety',
  'Certain foods',
];

export default function LogTriggersStep({ navigation, route }) {
  const { draft, toggleArrayField } = useLogDraft();

  const returnTo = route.params?.returnTo;

  const handleContinue = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.navigate('LogMedicationStep');
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
              width: `${(4 / 6) * 100}%`,
              height: '100%',
              backgroundColor: '#ad89dc',
              borderRadius: 999,
            }}
          />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question */}
          <View className="mt-2 mb-8">
            <Text className="font-reem text-4xl text-text-primary mb-3">
              What might have triggered it?
            </Text>
            <Text className="font-plein text-base text-text-secondary leading-6">
              Select all you suspect. Even guesses help us spot patterns.
            </Text>
          </View>

          {/* Triggers multi-select */}
          <MultiSelectList
            options={TRIGGER_OPTIONS}
            selected={draft.triggers}
            onToggle={(value) => toggleArrayField('triggers', value)}
            allowCustom
            customPlaceholder="Add custom trigger"
            onAddCustom={(value) => toggleArrayField('triggers', value)}
          />

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            className="mt-6 items-center rounded-full py-4 bg-brand active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-base text-text-inverse">
              Continue
            </Text>
          </Pressable>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}