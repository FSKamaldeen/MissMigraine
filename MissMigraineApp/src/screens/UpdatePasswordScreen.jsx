import React, { useEffect, useMemo, useState } from 'react';
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
  if (!password) return { label: 'Empty', color: '#472376', width: '0%' };
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

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
  if (!/\d/.test(password)) errors.push('one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('one symbol');
  return errors;
}

export default function UpdatePasswordScreen({ navigation, setAuthFlowActive }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const errors = useMemo(() => validatePassword(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = errors.length === 0 && passwordsMatch && !loading;

  useEffect(() => {
    // Block the authed stack from taking over from the moment this screen mounts
    setAuthFlowActive?.(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setHasSession(true);
        setChecking(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
          setHasSession(true);
          setChecking(false);
        }
      }
    );

    return () => {
      // Release the guard when the user leaves the screen
      setAuthFlowActive?.(false);
      authListener.subscription.unsubscribe();
    };
  }, [setAuthFlowActive]);

  const handleUpdatePassword = async () => {
    if (errors.length > 0) {
      Alert.alert('Weak password', `Please include ${errors.join(', ')}.`);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Please make sure both passwords are the same.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: password });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated. Please sign in.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    }
  };

  if (checking) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="font-plein text-text-primary">Verifying link...</Text>
      </SafeAreaView>
    );
  }

  if (!hasSession) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-8">
        <Text className="text-center font-reem text-3xl text-text-primary">
          Invalid or expired link
        </Text>
        <Pressable
          onPress={() => navigation.replace('ForgotPassword')}
          className="mt-6 rounded-full bg-brand px-6 py-3"
        >
          <Text className="font-plein-medium text-base text-text-inverse">Request new link</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-8 py-12">
            <View className="items-center mb-10">
              <Text
                className="mb-3 text-center font-reem text-5xl text-text-primary"
                style={{ lineHeight: 60 }}
              >
                Set new password
              </Text>
              <Text className="text-center font-plein text-base text-text-muted leading-7">
                Choose a strong password to keep your account safe.
              </Text>
            </View>

            <View className="mb-4 h-[54px] flex-row items-center rounded-full bg-surface px-5">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="New password"
                placeholderTextColor="#ad89dc"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
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
                  color="#ad89dc"
                />
              </Pressable>
            </View>

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

            <View className="mb-8 h-[54px] flex-row items-center rounded-full bg-surface px-5">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#ad89dc"
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
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
                  color="#ad89dc"
                />
              </Pressable>
            </View>

            <Pressable
              onPress={handleUpdatePassword}
              disabled={!canSubmit}
              className={`items-center rounded-full py-4 ${
                !canSubmit ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#11081b" />
              ) : (
                <Text className="font-plein-medium text-base text-text-inverse">
                  Update password
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}