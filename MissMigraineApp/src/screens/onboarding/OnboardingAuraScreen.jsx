import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const TOTAL_STEPS = 9;

const OPTIONS = [
  { value: 'yes_most', label: 'Yes, most of the time', auraPresent: true },
  { value: 'yes_sometimes', label: 'Sometimes', auraPresent: true },
  { value: 'no', label: 'No, never', auraPresent: false },
  { value: 'unsure_what', label: "I'm not sure what aura is", auraPresent: null },
];

export default function OnboardingAuraScreen({ navigation, route }) {
  const prevAnswers = route.params?.answers ?? {};
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const canContinue = selected !== null && !saving;

  const handleContinue = async () => {
    if (!canContinue) return;

    const option = OPTIONS.find((o) => o.value === selected);
    if (!option) return;

    setSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Session expired', 'Please log in again.');
        return;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ aura_present: option.auraPresent })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('AURA SAVE ERROR:', profileError);
        Alert.alert('Error', 'Could not save your answer. Please try again.');
        return;
      }

      navigation.navigate('OnboardingSymptoms', {
        answers: { ...prevAnswers, aura: selected },
      });
    } catch (err) {
      console.error('AURA SAVE ERROR:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Back arrow */}
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          disabled={saving}
          className="absolute top-4 left-4 z-10 p-2"
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
        </Pressable>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-8 pt-20 pb-12">
            {/* Progress bar */}
            <View className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
              <View
                style={{
                  width: `${(4 / TOTAL_STEPS) * 100}%`,
                  height: '100%',
                  backgroundColor: '#ad89dc',
                  borderRadius: 999,
                }}
              />
            </View>

            {/* Question */}
            <Text
              className="mb-3 font-reem text-4xl text-text-primary"
              style={{ lineHeight: 36 }}
            >
              Do you experience aura?
            </Text>
            <Text className="mb-10 font-plein text-base text-text-muted">
              Aura is a sensory change that happens before or during a
              migraine — like flashing lights, blind spots, or tingling.
            </Text>

            {/* Options */}
            <View className="gap-3">
              {OPTIONS.map((option) => {
                const isSelected = selected === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelected(option.value)}
                    disabled={saving}
                    className={`rounded-full border-[1.5px] px-5 py-4 ${
                      isSelected
                        ? 'border-brand-light bg-brand-dark/30'
                        : 'border-outline bg-surface'
                    }`}
                  >
                    <Text
                      className={`font-plein-medium text-base ${
                        isSelected ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Continue button */}
            <View className="mt-auto pt-10">
              <Pressable
                onPress={handleContinue}
                disabled={!canContinue}
                className={`items-center rounded-full py-4 ${
                  canContinue ? 'bg-brand active:bg-brand-dark' : 'bg-elevated'
                }`}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#11081b" />
                ) : (
                  <Text className="font-plein-medium text-base text-text-primary">
                    Continue
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}