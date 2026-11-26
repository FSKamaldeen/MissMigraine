import React, { useMemo, useState } from 'react';
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

function getPasswordStrength(password) {
  if (!password) {
    return { label: 'Empty', color: '#472376', width: '0%' };
  }
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 10 && hasLetters && hasNumbers && hasSymbol) {
    return { label: 'Strong', color: '#6ca45b', width: '100%' };
  }
  if (password.length >= 7 && hasLetters && hasNumbers) {
    return { label: 'Medium', color: '#ffe162', width: '65%' };
  }
  return { label: 'Weak', color: '#a01717', width: '35%' };
}

export default function TrustedPersonRegistrationScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRegister = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = invitationCode.trim().toUpperCase();
    const trimmedFullName = fullName.trim();
    const trimmedPreferredName = preferredName.trim();

    if (!trimmedFullName || trimmedFullName.length < 2) {
      Alert.alert('Missing name', 'Please enter your full name.');
      return;
    }

    if (!trimmedPreferredName || trimmedPreferredName.length < 2) {
      Alert.alert('Missing preferred name', 'Please enter the name you go by.');
      return;
    }

    if (!normalizedEmail || !password || !confirmPassword || !normalizedCode) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Please make sure both passwords are the same.');
      return;
    }

    if (strength.label === 'Weak') {
      Alert.alert('Weak password', 'Please use a stronger password.');
      return;
    }

    setSubmitting(true);

    try {
      const { data: mainUserId, error: codeError } = await supabase.rpc(
        'validate_trusted_code',
        { input_code: normalizedCode }
      );

      if (codeError || !mainUserId) {
        Alert.alert(
          'Invalid code',
          'This invitation code is not valid. Please ask the person you support for a new one.'
        );
        return;
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        Alert.alert(
          'Email already registered',
          'An account with this email already exists. Please log in instead.'
        );
        return;
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
      });

      if (otpError) {
        if (otpError.message.includes('rate limit') || otpError.status === 429) {
          Alert.alert('Too many requests', 'Please wait 60 seconds before trying again.');
        } else {
          Alert.alert('Registration failed', otpError.message);
        }
        return;
      }

      Alert.alert(
        'Check your email',
        `We've sent a 6-digit code to ${normalizedEmail}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('OTPVerification', {
                email: normalizedEmail,
                role: 'trusted_person',
                tempPassword: password,
                invitationCode: normalizedCode,
                fullName: trimmedFullName,
                preferredName: trimmedPreferredName,
              });
            },
          },
        ]
      );
    } catch (err) {
      console.error('TRUSTED REGISTER ERROR:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
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
          <View className="flex-1 justify-center px-8 pb-12">
            <Text
              className="mb-2 font-reem text-4xl text-text-primary"
              style={{ lineHeight: 48 }}
            >
              Create your account
            </Text>
            <Text className="mb-8 font-plein text-lg text-text-muted">
              Support someone you care about
            </Text>

            {/* Full name */}
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name"
              placeholderTextColor="#9262d0"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!submitting}
              className="mb-4 h-[54px] rounded-full bg-surface px-5 font-plein text-base text-text-primary"
            />

            {/* Preferred name */}
            <TextInput
              value={preferredName}
              onChangeText={setPreferredName}
              placeholder="Preferred name"
              placeholderTextColor="#9262d0"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!submitting}
              className="mb-4 h-[54px] rounded-full bg-surface px-5 font-plein text-base text-text-primary"
            />

            {/* Email */}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9262d0"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!submitting}
              className="mb-4 h-[54px] rounded-full bg-surface px-5 font-plein text-base text-text-primary"
            />

            {/* Password */}
            <View className="mb-4 h-[54px] flex-row items-center rounded-full bg-surface px-5">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9262d0"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
                className="flex-1 font-plein text-base text-text-primary"
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                hitSlop={10}
                className="-mr-2 p-2"
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9262d0"
                />
              </Pressable>
            </View>

            {/* Strength */}
            <View className="mb-4 h-5 flex-row items-center gap-3">
              <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
                <View
                  style={{
                    width: strength.width,
                    height: '100%',
                    backgroundColor: strength.color,
                    borderRadius: 999,
                  }}
                />
              </View>
              <View className="items-end">
                <Text
                  className="font-plein-medium text-xs"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </Text>
              </View>
            </View>

            {/* Confirm password */}
            <View className="mb-4 h-[54px] flex-row items-center rounded-full bg-surface px-5">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor="#9262d0"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
                className="flex-1 font-plein text-base text-text-primary"
              />
              <Pressable
                onPress={() => setShowConfirm((s) => !s)}
                hitSlop={10}
                className="-mr-2 p-2"
              >
                <MaterialCommunityIcons
                  name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9262d0"
                />
              </Pressable>
            </View>

            {/* Invitation code */}
            <TextInput
              value={invitationCode}
              onChangeText={setInvitationCode}
              placeholder="Invitation code (MIG-XXXX-XXXX)"
              placeholderTextColor="#9262d0"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!submitting}
              className="mb-10 h-[54px] rounded-full bg-surface px-5 font-plein text-base tracking-widest text-text-primary"
            />

            <Pressable
              onPress={handleRegister}
              disabled={submitting}
              className={`items-center rounded-full py-4 ${
                submitting ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
              }`}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#f1ebf9" />
              ) : (
                <Text className="font-plein-medium text-base text-text-primary">
                  Create account
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}