import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoadingScreen from './app/LoadingScreen';
import LoginScreen from './app/LoginScreen';
import RegistrationScreen, { OnboardingScreen, OtpVerificationScreen } from './app/RegistrationScreen';
import MainApp from './app/MainApp';
import TrustedApp from './app/TrustedApp';
import RegisterSelectionScreen from './app/RegisterSelectionScreen';
import TrustedPersonRegistrationScreen from './app/TrustedPersonRegistrationScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterSelection" component={RegisterSelectionScreen} />
            <Stack.Screen name="UserRegistration" component={RegistrationScreen} />
            <Stack.Screen name="TrustedPersonRegistration" component={TrustedPersonRegistrationScreen} />
            <Stack.Screen name="OTPVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainApp" component={MainApp} />
            <Stack.Screen name="TrustedApp" component={TrustedApp} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}