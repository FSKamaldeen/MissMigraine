import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const TOTAL_STEPS = 9;

export default function OnboardingNameScreen({ navigation }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const canContinue = trimmedName.length >= 2 && !saving;

  const handleContinue = async () => {
    if (!canContinue) return;

    setSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Session expired', 'Please log in again.');
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ preferred_name: trimmedName })
        .eq('id', user.id);

      if (updateError) {
        console.error('PREFERRED NAME SAVE ERROR:', updateError);
        Alert.alert('Error', 'Could not save your name. Please try again.');
        setSaving(false);
        return;
      }

      navigation.navigate('OnboardingIntro', {
        answers: { name: trimmedName },
      });
    } catch (err) {
      console.error('PREFERRED NAME SAVE ERROR:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
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
          <View className="flex-1 px-8 pt-24 pb-12">
            <View className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
              <View
                style={{
                  width: `${(1 / TOTAL_STEPS) * 100}%`,
                  height: '100%',
                  backgroundColor: '#ad89dc',
                  borderRadius: 999,
                }}
              />
            </View>

            <Text
              className="mb-3 font-reem text-5xl text-text-primary"
              style={{ lineHeight: 58 }}
            >
              What should we call you?
            </Text>
            <Text className="mb-10 font-plein text-lg text-text-secondary">
              This is how we'll say hello.
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Preferred name"
              placeholderTextColor="#ad89dc"
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={handleContinue}
              editable={!saving}
              className="h-[54px] rounded-full bg-surface px-5 font-plein text-base text-text-primary"
            />

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