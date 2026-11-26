import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { supabase } from '../../lib/supabase';

export default function OnboardingCompleteScreen({ navigation, route, setAuthFlowActive }) {
  const answers = route.params?.answers ?? {};
  const name = answers.name || 'there';
  const confettiRef = useRef(null);
  const { width, height } = useWindowDimensions();
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

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('ONBOARDING COMPLETE ERROR:', updateError);
        Alert.alert(
          'Error',
          'Could not finalize your profile. Please try again.'
        );
        return;
      }

      // Flow is complete — release the guard so the authed stack takes over
      setAuthFlowActive?.(false);
      navigation.replace('MainApp', { role: 'user' });
    } catch (err) {
      console.error('ONBOARDING COMPLETE ERROR:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ConfettiCannon
        ref={confettiRef}
        count={120}
        origin={{ x: width / 2, y: height }}
        fadeOut
        autoStart
        autoStartDelay={0}
        explosionSpeed={600}
        fallSpeed={2500}
        colors={['#ad89dc', '#c8b0e8', '#763bc4', '#f1ebf9', '#472376']}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-8">
          <View className="items-center mb-10">
            <Text
              className="mb-3 text-center font-reem text-5xl text-text-primary"
              style={{ lineHeight: 60 }}
            >
              You're all set, {name}!
            </Text>
            <Text className="text-center font-plein text-lg text-text-secondary leading-7">
              We've got everything we need to personalize your experience.
            </Text>
          </View>

          <Text className="mb-4 text-center font-plein text-base text-text-muted leading-7">
            From here, you can log migraines, track your cycle, and start
            spotting patterns.
          </Text>

          <Pressable
            onPress={handleContinue}
            disabled={saving}
            className={`mt-10 items-center rounded-full py-4 ${
              saving ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
            }`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#11081b" />
            ) : (
              <Text className="font-plein-medium text-base text-text-primary">
                Let's go
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}