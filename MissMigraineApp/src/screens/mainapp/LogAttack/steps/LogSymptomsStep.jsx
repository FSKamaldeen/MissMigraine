import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLogDraft } from '../LogDraftContext';
import MultiSelectList from '../components/MultiSelectList';

const SYMPTOM_OPTIONS = [
  'Nausea',
  'Vomiting',
  'Photophobia',
  'Phonophobia',
  'Aura',
  'Dizziness',
  'Vertigo',
  'Fatigue',
  'Neck pain',
  'Brain fog',
  'Blurred vision',
  'Tingling',
  'Weakness',
  'Confusion',
  'Mood changes',
  'Yawning',
  'Food cravings',
];

export default function LogSymptomsStep({ navigation, route }) {
  const { draft, updateDraft, toggleArrayField } = useLogDraft();

  const returnTo = route.params?.returnTo;

  const handleContinue = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.navigate('LogTriggersStep');
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
              width: `${(3 / 6) * 100}%`,
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
              What are you feeling?
            </Text>
            <Text className="font-plein text-base text-text-secondary leading-6">
              Select all that apply. This will help us spot patterns.
            </Text>
          </View>

          {/* Symptoms multi-select */}
          <MultiSelectList
            options={SYMPTOM_OPTIONS}
            selected={draft.symptoms}
            onToggle={(value) => toggleArrayField('symptoms', value)}
            allowCustom
            customPlaceholder="Add custom symptom"
            onAddCustom={(value) => toggleArrayField('symptoms', value)}
          />

          {/* Aura block */}
          <View className="mt-6 rounded-2xl bg-elevated p-5">
            <Text className="mb-3 font-plein-medium text-sm text-text-primary">
              Did you experience aura?
            </Text>

            <View className="flex-row gap-3">
              <Text
                onPress={() => updateDraft({ hasAura: true })}
                className={`flex-1 rounded-full py-3 text-center font-plein-medium text-sm ${
                  draft.hasAura
                    ? 'bg-brand text-text-inverse'
                    : 'bg-surface text-text-secondary'
                }`}
              >
                Yes
              </Text>
              <Text
                onPress={() => updateDraft({ hasAura: false, auraDescription: '' })}
                className={`flex-1 rounded-full py-3 text-center font-plein-medium text-sm ${
                  !draft.hasAura
                    ? 'bg-brand text-text-inverse'
                    : 'bg-surface text-text-secondary'
                }`}
              >
                No
              </Text>
            </View>

            {draft.hasAura && (
              <View className="mt-4">
                <Text className="mb-2 font-plein-medium text-xs uppercase tracking-wider text-text-muted">
                  What was it like?
                </Text>
                <TextInput
                  value={draft.auraDescription}
                  onChangeText={(text) => updateDraft({ auraDescription: text })}
                  placeholder="Flashing lights, blind spots, tingling…"
                  placeholderTextColor="#c8b0e8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="rounded-xl bg-surface px-4 py-3 font-plein text-sm text-text-primary"
                  style={{ minHeight: 80 }}
                />
              </View>
            )}
          </View>

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