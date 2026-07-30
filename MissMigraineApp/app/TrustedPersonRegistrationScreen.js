import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

function getPasswordStrength(password) {
  if (!password) {
    return { label: 'Weak', color: '#d94764', width: '20%' };
  }
  const hasLetters = /[A-Za-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 10 && hasLetters && hasNumbers && hasSymbol) {
    return { label: 'Strong', color: '#2f855a', width: '100%' };
  }
  if (password.length >= 7 && hasLetters && hasNumbers) {
    return { label: 'Medium', color: '#d69e2e', width: '65%' };
  }
  return { label: 'Weak', color: '#d94764', width: '35%' };
}

export default function TrustedPersonRegistrationScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const [fontsLoaded] = useFonts({
    'ReemKufi-Medium': require('../assets/fonts/ReemKufi-Medium.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium': require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light': require('../assets/fonts/Plein-Light.otf'),
  });

  const handleRegister = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigation.navigate('OTPVerification', {
        email: email.trim(),
        role: 'trusted_person',
      });
    }, 350);
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7f011f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Set up your Miss Migraine trusted account</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#aaaaaa"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#aaaaaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.strengthRow}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#aaaaaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>Invitation Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Invitation Code (received via email)"
              placeholderTextColor="#aaaaaa"
              value={invitationCode}
              onChangeText={setInvitationCode}
              autoCapitalize="characters"
            />

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, submitting && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </Pressable>
          </View>

          <Pressable style={({ pressed }) => [styles.loginLinkWrap, pressed && styles.linkPressed]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Already have an account? Login</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 30,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Plein-Light',
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ececec',
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 7,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e2e2',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: 'Plein-Regular',
    color: '#0d0d0d',
  },
  strengthRow: {
    marginTop: 8,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  strengthTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#ececec',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 999,
  },
  strengthText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  buttonPressed: {
    backgroundColor: '#ff727b',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Plein-Medium',
  },
  loginLinkWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  linkPressed: {
    opacity: 0.65,
  },
});
