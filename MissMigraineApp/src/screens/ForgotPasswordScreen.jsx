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
import { supabase } from '../lib/supabase';
import { makeRedirectUri } from 'expo-auth-session';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSendResetLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const redirectTo = makeRedirectUri({
        scheme: 'missmigraine',
        path: 'reset-password',
      });

      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo }
      );

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      Alert.alert(
        'Check your inbox',
        `If an account exists for ${normalizedEmail}, we've sent a reset link.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      // Start 60-second cooldown
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          className="absolute top-4 left-4 z-10 p-2"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#f1ebf9"
          />
        </Pressable>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-8 py-12">
            <View className="items-center mb-10">
              <Text
                className="mb-3 text-center font-reem text-5xl text-text-primary"
                style={{ lineHeight: 60 }}
              >
                Forgot password?
              </Text>
              <Text className="text-center font-plein text-lg text-text-muted leading-7">
                Enter your email below to receive your password reset link.
              </Text>
            </View>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#ad89dc"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              className="mb-8 h-[54px] rounded-full bg-surface px-5 font-plein text-base text-text-primary"
            />

            <Pressable
              onPress={handleSendResetLink}
              disabled={loading || cooldown > 0}
              className={`items-center rounded-full py-4 ${
                loading || cooldown > 0 ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#11081b" />
              ) : (
                <Text className="font-plein-medium text-base text-text-inverse">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send reset link'}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}