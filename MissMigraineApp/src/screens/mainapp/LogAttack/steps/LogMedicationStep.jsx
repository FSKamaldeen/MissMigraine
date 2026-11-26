import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLogDraft } from '../LogDraftContext';
import MultiSelectList from '../components/MultiSelectList';

const MEDICATION_OPTIONS = [
  'Ibuprofen',
  'Naproxen',
  'Paracetamol',
  'Aspirin',
  'Sumatriptan',
  'Rizatriptan',
  'Zolmitriptan',
  'Eletriptan',
  'Propranolol',
  'Amitriptyline',
  'Topiramate',
  'Anti-nausea',
];

export default function LogMedicationStep({ navigation, route }) {
  const { draft, toggleArrayField } = useLogDraft();

  const returnTo = route.params?.returnTo;

  const handleContinue = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.navigate('LogNotesStep');
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
              width: `${(5 / 6) * 100}%`,
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
              Did you take anything?
            </Text>
            <Text className="font-plein text-base text-text-secondary leading-6">
              Select all medications you took for this migraine.
            </Text>
          </View>

          {/* Medications multi-select */}
          <MultiSelectList
            options={MEDICATION_OPTIONS}
            selected={draft.medications}
            onToggle={(value) => toggleArrayField('medications', value)}
            allowCustom
            customPlaceholder="Add custom medication"
            onAddCustom={(value) => toggleArrayField('medications', value)}
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