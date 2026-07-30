import React, { useState } from 'react';
import {
  Alert,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    'ReemKufi-Medium': require('../assets/fonts/ReemKufi-Medium.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium': require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light': require('../assets/fonts/Plein-Light.otf'),
  });

  const handleLogin = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'user') {
      navigation.replace('MainApp', { role: 'user' });
      return;
    }

    if (normalizedEmail === 'trusted') {
      navigation.replace('TrustedApp', { role: 'trusted_person' });
      return;
    }

    Alert.alert("Invalid credentials. Please enter 'user' or 'trusted'.");
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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerIcon}>
              <MaterialCommunityIcons name="heart-pulse" size={36} color="#7f011f" />
            </View>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>Sign in to track your migraines</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#7f011f" style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email (type 'user' or 'trusted')"
                  placeholderTextColor="#d0d0d0"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#7f011f" style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password (anything works)"
                  placeholderTextColor="#d0d0d0"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#7f011f"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
            onPress={handleLogin}
          >
            <MaterialCommunityIcons name="login" size={20} color="#ffffff" />
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerSection}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Don't have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <Pressable
            style={({ pressed }) => [styles.registerButton, pressed && styles.registerButtonPressed]}
            onPress={() => navigation.navigate('RegisterSelection')}
          >
            <Text style={styles.registerButtonText}>Create New Account</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </ScrollView>

      {/* Decorative elements */}
      <View style={[styles.decor, styles.decorTop]} />
      <View style={[styles.decor, styles.decorBottom]} />
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f5e6eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 32,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 15,
    fontFamily: 'Plein-Light',
    color: '#888888',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Plein-Regular',
    color: '#0d0d0d',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#7f011f',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  loginButtonPressed: {
    backgroundColor: '#ff727b',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Plein-Medium',
  },
  loginHintText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#777777',
  },
  dividerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8e8e8',
  },
  dividerText: {
    fontSize: 13,
    fontFamily: 'Plein-Light',
    color: '#888888',
  },
  registerButton: {
    backgroundColor: '#f5e6eb',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d9b3c0',
    paddingVertical: 13,
    alignItems: 'center',
  },
  registerButtonPressed: {
    backgroundColor: '#ead9e8',
  },
  registerButtonText: {
    color: '#7f011f',
    fontSize: 15,
    fontFamily: 'Plein-Medium',
  },
  decor: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decorTop: {
    width: 200,
    height: 200,
    top: -80,
    right: -40,
    backgroundColor: 'rgba(255, 114, 123, 0.08)',
  },
  decorBottom: {
    width: 150,
    height: 150,
    bottom: -50,
    left: -30,
    backgroundColor: 'rgba(127, 1, 31, 0.08)',
  },
});
