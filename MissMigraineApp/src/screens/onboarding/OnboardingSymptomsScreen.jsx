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
  { value: 'throbbing', label: 'Throbbing or pulsing pain' },
  { value: 'one_sided', label: 'Pain on one side' },
  { value: 'worse_movement', label: 'Worse with movement' },
  { value: 'nausea', label: 'Nausea or vomiting' },
  { value: 'light_sensitivity', label: 'Sensitivity to light' },
  { value: 'sound_sensitivity', label: 'Sensitivity to sound' },
  { value: 'smell_sensitivity', label: 'Sensitivity to smell' },
  { value: 'neck_pain', label: 'Neck pain or stiffness' },
  { value: 'dizziness', label: 'Dizziness or vertigo' },
];

export default function OnboardingSymptomsScreen({ navigation, route }) {
  const prevAnswers = route.params?.answers ?? {};
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  const canContinue = selected.length > 0 && !saving;

  const toggleOption = (value) => {
    if (saving) return;
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    setSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Session expired', 'Please log in again.');
        return;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ common_symptoms: selected })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('SYMPTOMS SAVE ERROR:', profileError);
        Alert.alert('Error', 'Could not save your answer. Please try again.');
        return;
      }

      navigation.navigate('OnboardingMenstrual', {
        answers: { ...prevAnswers, symptoms: selected },
      });
    } catch (err) {
      console.error('SYMPTOMS SAVE ERROR:', err);
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
                  width: `${(5 / TOTAL_STEPS) * 100}%`,
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
              What does a typical migraine feel like?
            </Text>
            <Text className="mb-10 font-plein text-base text-text-muted">
              Select all that apply. These will be pre-filled when you log a
              migraine, so you only have to confirm or adjust.
            </Text>

            {/* Options */}
            <View className="gap-3">
              {OPTIONS.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => toggleOption(option.value)}
                    disabled={saving}
                    className={`flex-row items-center justify-between rounded-full border-[1.5px] px-5 py-4 ${
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

                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color="#ad89dc"
                      />
                    )}
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