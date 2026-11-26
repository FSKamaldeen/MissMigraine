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
import Calendar from '../../components/common/Calendar';
import { supabase } from '../../lib/supabase';

const TOTAL_STEPS = 9;

function formatDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysAgo(date) {
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function OnboardingLastPeriodScreen({ navigation, route }) {
  const prevAnswers = route.params?.answers ?? {};

  const [date, setDate] = useState(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (saving) return;

    setSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Session expired', 'Please log in again.');
        return;
      }

      const { error: cycleError } = await supabase
        .from('cycle_entries')
        .insert({
          user_id: user.id,
          period_start: toDateKey(date),
        });

      if (cycleError) {
        console.error('LAST PERIOD SAVE ERROR:', cycleError);
        Alert.alert('Error', 'Could not save your date. Please try again.');
        return;
      }

      navigation.navigate('OnboardingDiagnosis', {
        answers: {
          ...prevAnswers,
          lastPeriodStart: date.toISOString(),
        },
      });
    } catch (err) {
      console.error('LAST PERIOD SAVE ERROR:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const ago = daysAgo(date);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          <View className="flex-1 px-8 pt-20 pb-12">
            <View className="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
              <View
                style={{
                  width: `${(7 / TOTAL_STEPS) * 100}%`,
                  height: '100%',
                  backgroundColor: '#ad89dc',
                  borderRadius: 999,
                }}
              />
            </View>

            <Text
              className="mb-3 font-reem text-4xl text-text-primary"
              style={{ lineHeight: 36 }}
            >
              When did your last period start?
            </Text>
            <Text className="mb-10 font-plein text-base text-text-muted">
              We'll use this to predict your current cycle phase and
              correlate your migraines with hormonal patterns.
            </Text>

            <Pressable
              onPress={() => !saving && setShowCalendar((s) => !s)}
              disabled={saving}
              className="rounded-2xl border-[1.5px] border-outline bg-surface px-5 py-4"
            >
              <Text className="font-plein text-lg text-text-muted">
                Last period started on
              </Text>
              <View className="mt-1 flex-row items-center justify-between">
                <Text className="font-plein-medium text-lg text-text-primary">
                  {formatDate(date)}
                </Text>
                <MaterialCommunityIcons
                  name={showCalendar ? 'chevron-up' : 'calendar-blank-outline'}
                  size={20}
                  color="#ad89dc"
                />
              </View>
              <Text className="mt-1 font-plein text-base text-text-secondary">
                {ago === 0
                  ? 'Today'
                  : ago === 1
                  ? 'Yesterday'
                  : `${ago} days ago`}
              </Text>
            </Pressable>

            {showCalendar && (
              <View className="mt-4">
                <Calendar
                  mode="single"
                  value={date}
                  maxDate={new Date()}
                  onChange={(newDate) => {
                    setDate(newDate);
                  }}
                />
              </View>
            )}

            <View className="mt-auto pt-10">
              <Pressable
                onPress={handleContinue}
                disabled={saving}
                className={`items-center rounded-full py-4 ${
                  saving ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
                }`}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#11081b" />
                ) : (
                  <Text className="font-plein-medium text-base text-text-inverse">
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