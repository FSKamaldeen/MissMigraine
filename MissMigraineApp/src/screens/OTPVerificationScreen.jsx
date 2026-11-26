import React, { useEffect, useRef, useState } from 'react';
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
import { supabase } from '../lib/supabase';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OTPVerificationScreen({ navigation, route, setAuthFlowActive }) {
  const { email = '', role = 'main_user' } = route.params ?? {};

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);

  const inputs = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const canResend = secondsLeft === 0;

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      Alert.alert('Incomplete code', 'Please enter all 6 digits.');
      return;
    }

    const {
      email,
      tempPassword,
      role,
      invitationCode,
      fullName,
      preferredName,
    } = route.params ?? {};

    if (!email) {
      Alert.alert('Error', 'Email is missing. Please go back and try again.');
      return;
    }

    setSubmitting(true);

    // Block the authed stack from taking over as soon as the session exists
    setAuthFlowActive?.(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: fullCode,
        type: 'email',
      });

      if (error) {
        // Verification failed → release the guard so the app is back to normal
        setAuthFlowActive?.(false);
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          Alert.alert('Invalid code', 'The code is invalid or has expired. Please request a new one.');
        } else {
          Alert.alert('Verification failed', error.message);
        }
        return;
      }

      if (!data.session) {
        setAuthFlowActive?.(false);
        Alert.alert('Error', 'Verification succeeded but no session was created. Please try again.');
        return;
      }

      const userId = data.session.user.id;

      if (tempPassword) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: tempPassword,
        });

        if (updateError) {
          setAuthFlowActive?.(false);
          Alert.alert(
            'Password error',
            'Verified, but could not set password. Please try logging in or contact support.'
          );
          return;
        }
      }

      if (fullName?.trim()) {
        const { error: nameError } = await supabase
          .from('users')
          .update({ full_name: fullName.trim() })
          .eq('id', userId);

        if (nameError) {
          console.error('FULL NAME SAVE ERROR:', nameError);
        }
      }

      if (role === 'trusted_person') {
        if (!invitationCode) {
          setAuthFlowActive?.(false);
          Alert.alert('Error', 'Invitation code is missing. Please start over.');
          return;
        }

        const { data: mainUserId, error: linkError } = await supabase.rpc(
          'link_trusted_person',
          { input_code: invitationCode }
        );

        if (linkError || !mainUserId) {
          setAuthFlowActive?.(false);
          console.error('LINK TRUSTED PERSON ERROR:', linkError);
          Alert.alert(
            'Could not complete registration',
            'Your code may have been used by someone else. Please contact the person who invited you.'
          );
          return;
        }

        if (preferredName?.trim()) {
          const { error: prefError } = await supabase
            .from('users')
            .update({ preferred_name: preferredName.trim() })
            .eq('id', userId);

          if (prefError) {
            console.error('PREFERRED NAME SAVE ERROR:', prefError);
          }
        }
      } else {
        const { error: setupError } = await supabase.rpc('setup_user_profile_for_new_user');
        if (setupError) {
          console.error('TRUSTED CODE SETUP ERROR:', setupError);
        }
      }

      // Navigation — keep the guard set; onboarding/welcome will release it at the end
      if (role === 'trusted_person') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TrustedWelcome', params: { name: preferredName || 'there' } }],
        });
      } else {
        navigation.replace('OnboardingName', { role: 'user' });
      }
    } catch (err) {
      console.error('OTP VERIFY ERROR:', err);
      setAuthFlowActive?.(false);
      Alert.alert('Error', 'Verification failed. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    const { email } = route.params ?? {};
    if (!email) {
      Alert.alert('Error', 'Email is missing.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      });

      if (error) {
        if (error.message.includes('rate limit') || error.status === 429) {
          Alert.alert('Too many requests', 'Please wait a moment before requesting a new code.');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }

      setSecondsLeft(RESEND_COOLDOWN);
      setCode(['', '', '', '', '', '']);
      setFocusedIndex(0);
      inputs.current[0]?.focus();

      Alert.alert('Code resent', `We've sent a new code to ${email}.`);
    } catch (err) {
      Alert.alert('Error', 'Could not resend code. Please try again.');
    }
  };

  // ... UI unchanged
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          disabled={submitting}
          className="absolute top-4 left-4 z-10 p-2"
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
        </Pressable>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-8 pt-12 pb-12">
            <Text
              className="mb-2 text-center font-reem text-4xl text-text-primary"
              style={{ lineHeight: 48 }}
            >
              Account Verification
            </Text>
            <Text className="mb-10 text-center font-plein text-lg text-text-muted">
              Enter the code sent to{' '}
              <Text className="text-brand-light">{email || 'your email'}</Text>
            </Text>

            <View className="mb-10 flex-row justify-between">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputs.current[index] = ref)}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectionColor="#ad89dc"
                  editable={!submitting}
                  style={{
                    width: 48,
                    height: 58,
                    borderRadius: 16,
                    backgroundColor: '#211136',
                    color: '#f1ebf9',
                    fontSize: 22,
                    fontFamily: 'Plein-Medium',
                    borderWidth: 1.5,
                    borderColor:
                      focusedIndex === index
                        ? '#ad89dc'
                        : digit
                        ? '#472376'
                        : '#2f174f',
                  }}
                />
              ))}
            </View>

            <Pressable
              onPress={handleVerify}
              disabled={submitting}
              className={`items-center rounded-full py-4 ${
                submitting ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#f1ebf9" />
              ) : (
                <Text className="font-plein-medium text-base text-text-primary">
                  Verify
                </Text>
              )}
            </Pressable>

            <View className="mt-6 items-center">
              {canResend ? (
                <Pressable onPress={handleResend} disabled={submitting}>
                  <Text className="font-plein text-base text-text-muted">
                    Didn't get a code?{' '}
                    <Text className="text-brand-light">Resend Code</Text>
                  </Text>
                </Pressable>
              ) : (
                <Text className="font-plein text-base text-text-muted">
                  Resend in{' '}
                  <Text className="text-brand-light">{secondsLeft}s</Text>
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}