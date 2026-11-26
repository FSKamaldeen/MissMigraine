import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!normalizedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          Alert.alert('Login failed', 'Incorrect email or password.');
        } else if (authError.message === 'Email not confirmed') {
          Alert.alert('Login failed', 'Please verify your email before signing in.');
        } else {
          Alert.alert('Login failed', 'Unable to sign in. Please try again.');
        }
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .rpc('get_my_role');

      if (roleError || !roleData) {
        Alert.alert('Error', 'Could not fetch user role.');
        return;
      }

      if (roleData === 'user') {
        navigation.replace('MainApp');
      } else if (roleData === 'trusted_person') {
        navigation.replace('TrustedApp');
      } else if (roleData === 'admin') {
        navigation.replace('MainApp');
      } else {
        Alert.alert('Error', 'Unknown user role.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'undefined'}
        className="flex-1"
      >
        {/* Header */}
        <View className="relative h-[260px] justify-center">
          <Image
            source={require('../assets/images/sidepeek.png')}
            style={{
              position: 'absolute',
              right: 0,
              top: 20,
              width: 210,
              height: 320,
            }}
            resizeMode="contain"
          />
          <View className="pl-8 pr-[140px] pt-40">
            <Text className="mb-3 font-reem text-6xl text-text-primary">
              Welcome back!
            </Text>
            <Text className="font-plein text-lg text-text-muted pr-[10px]">
              Sign in to continue your journey.
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-8 pb-12 pt-16">
          {/* Form */}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#ad89dc"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              className="mb-4 h-[54px] rounded-full bg-surface px-5 font-plein text-base text-text-primary"
            />

            <View className="mb-2 h-[54px] flex-row items-center rounded-full bg-surface px-5">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#ad89dc"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
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

            {/* Forgot password */}
            <Pressable
              onPress={handleForgotPassword}
              className="mt-2 mb-4 self-end"
              hitSlop={8}
            >
              <Text className="font-plein text-base text-brand-light">
                Forgot password?
              </Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              className={`items-center rounded-full py-4 ${
                loading ? 'bg-brand-dark' : 'bg-brand active:bg-brand-dark'
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#11081b" />
              ) : (
                <Text className="font-plein-medium text-base text-text-inverse">
                  Sign in
                </Text>
              )}
            </Pressable>

            {/* Sign up link */}
            <Pressable
              onPress={() => navigation.navigate('RegisterSelection')}
              className="mt-8 items-center"
            >
              <Text className="font-plein text-base text-text-muted">
                Don't have an account?{' '}
                <Text className="text-brand-light">Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}