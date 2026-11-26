import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getStateFromPath } from '@react-navigation/native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import UpdatePasswordScreen from '../screens/UpdatePasswordScreen';
import RegisterSelectionScreen from '../screens/RegisterSelectionScreen';
import TrustedPersonRegistrationScreen from '../screens/TrustedPersonRegistrationScreen';
import UserRegistrationScreen from '../screens/UserRegistrationScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import QuickLogHandler from '../screens/QuickLogHandler';

// Onboarding
import OnboardingNameScreen from '../screens/onboarding/OnboardingNameScreen';
import OnboardingIntroScreen from '../screens/onboarding/OnboardingIntroScreen';
import OnboardingOnsetScreen from '../screens/onboarding/OnboardingOnsetScreen';
import OnboardingFrequencyScreen from '../screens/onboarding/OnboardingFrequencyScreen';
import OnboardingAuraScreen from '../screens/onboarding/OnboardingAuraScreen';
import OnboardingSymptomsScreen from '../screens/onboarding/OnboardingSymptomsScreen';
import OnboardingMenstrualScreen from '../screens/onboarding/OnboardingMenstrualScreen';
import OnboardingLastPeriodScreen from '../screens/onboarding/OnboardingLastPeriodScreen';
import OnboardingDiagnosisScreen from '../screens/onboarding/OnboardingDiagnosisScreen';
import OnboardingGoalScreen from '../screens/onboarding/OnboardingGoalScreen';
import OnboardingCompleteScreen from '../screens/onboarding/OnboardingCompleteScreen';

import MainTabNavigator from './MainTabNavigator';
import TrustedAppScreen from '../screens/trustedapp/TrustedAppScreen';
import TrustedWelcomeScreen from '../screens/trustedapp/TrustedWelcomeScreen';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['missmigraine://'],
  config: {
    screens: {
      UpdatePassword: 'reset-password',
      QuickLog: 'quick-log',
    },
  },
  getStateFromPath: (path, options) => {
    const cleanPath = path.replace('#', '?');
    return getStateFromPath(cleanPath, options);
  },
};

// Wrappers that inject the auth-flow guard setter

function OTPVerificationWrapper({ navigation, route, setAuthFlowActive }) {
  return (
    <OTPVerificationScreen
      navigation={navigation}
      route={route}
      setAuthFlowActive={setAuthFlowActive}
    />
  );
}

function UpdatePasswordWrapper({ navigation, route, setAuthFlowActive }) {
  return (
    <UpdatePasswordScreen
      navigation={navigation}
      route={route}
      setAuthFlowActive={setAuthFlowActive}
    />
  );
}

function OnboardingCompleteWrapper({ navigation, route, setAuthFlowActive }) {
  return (
    <OnboardingCompleteScreen
      navigation={navigation}
      route={route}
      setAuthFlowActive={setAuthFlowActive}
    />
  );
}

function TrustedWelcomeWrapper({ navigation, route, setAuthFlowActive }) {
  return (
    <TrustedWelcomeScreen
      navigation={navigation}
      route={route}
      setAuthFlowActive={setAuthFlowActive}
    />
  );
}

export default function RootNavigator({
  splashDone,
  onSplashFinish,
  session,
  userRole,
  authFlowActive,
  setAuthFlowActive,
}) {
  // Auth stacks only render when NOT in a flow
  const authedUser = session && userRole === 'user' && !authFlowActive;
  const authedTrusted = session && userRole === 'trusted_person' && !authFlowActive;

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: '#11081b' },
        }}
      >
        {!splashDone ? (
          <Stack.Screen name="Splash">
            {(props) => <SplashScreen {...props} onFinish={onSplashFinish} />}
          </Stack.Screen>
        ) : authedUser ? (
          <>
            <Stack.Screen name="MainApp" component={MainTabNavigator} />
            <Stack.Screen name="QuickLog" component={QuickLogHandler} />
          </>
        ) : authedTrusted ? (
          <>
            <Stack.Screen name="TrustedApp" component={TrustedAppScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

            <Stack.Screen name="UpdatePassword">
              {(props) => (
                <UpdatePasswordWrapper
                  {...props}
                  setAuthFlowActive={setAuthFlowActive}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="RegisterSelection" component={RegisterSelectionScreen} />
            <Stack.Screen name="TrustedPersonRegistration" component={TrustedPersonRegistrationScreen} />
            <Stack.Screen name="UserRegistration" component={UserRegistrationScreen} />

            <Stack.Screen name="OTPVerification">
              {(props) => (
                <OTPVerificationWrapper
                  {...props}
                  setAuthFlowActive={setAuthFlowActive}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="TrustedWelcome">
              {(props) => (
                <TrustedWelcomeWrapper {...props} setAuthFlowActive={setAuthFlowActive} />
              )}
            </Stack.Screen>

            <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
            <Stack.Screen name="OnboardingIntro" component={OnboardingIntroScreen} />
            <Stack.Screen name="OnboardingOnset" component={OnboardingOnsetScreen} />
            <Stack.Screen name="OnboardingFrequency" component={OnboardingFrequencyScreen} />
            <Stack.Screen name="OnboardingAura" component={OnboardingAuraScreen} />
            <Stack.Screen name="OnboardingSymptoms" component={OnboardingSymptomsScreen} />
            <Stack.Screen name="OnboardingMenstrual" component={OnboardingMenstrualScreen} />
            <Stack.Screen name="OnboardingLastPeriod" component={OnboardingLastPeriodScreen} />
            <Stack.Screen name="OnboardingDiagnosis" component={OnboardingDiagnosisScreen} />
            <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
            <Stack.Screen name="OnboardingComplete">
              {(props) => (
                <OnboardingCompleteWrapper {...props} setAuthFlowActive={setAuthFlowActive} />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}