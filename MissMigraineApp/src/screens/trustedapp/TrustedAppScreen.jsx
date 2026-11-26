import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import TrustedHomeScreen from './TrustedHomeScreen';
import SharedDataScreen from './SharedDataScreen';
import TrustedMoreScreen from './More/TrustedMoreScreen';
import TrustedAccountScreen from './More/TrustedAccountScreen';
import TrustedNotificationsScreen from './More/TrustedNotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stacks

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrustedHomeMain" component={TrustedHomeScreen} />
    </Stack.Navigator>
  );
}

function SharedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SharedDataMain" component={SharedDataScreen} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrustedMoreMain" component={TrustedMoreScreen} />
      <Stack.Screen name="TrustedAccount" component={TrustedAccountScreen} />
      <Stack.Screen
        name="TrustedNotifications"
        component={TrustedNotificationsScreen}
      />
    </Stack.Navigator>
  );
}

// Main tab navigator

export default function TrustedAppScreen() {
  const insets = useSafeAreaInsets();

  const TAB_ICONS = {
    TrustedHomeTab: 'home-outline',
    SharedDataTab: 'account-heart-outline',
    TrustedMoreTab: 'dots-horizontal',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#f1ebf9',
        tabBarInactiveTintColor: '#ad89dc',
        tabBarStyle: {
          backgroundColor: '#211136',
          borderTopWidth: 0,
          height: 68 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          shadowColor: '#11081b',
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Plein-Medium',
          fontWeight: '600',
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <MaterialCommunityIcons
            name={TAB_ICONS[route.name] || 'circle'}
            size={22}
            color={color}
            style={{ opacity: focused ? 1 : 0.95 }}
          />
        ),
      })}
    >
      <Tab.Screen
        name="TrustedHomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="SharedDataTab"
        component={SharedStack}
        options={{ title: 'Shared' }}
      />
      <Tab.Screen
        name="TrustedMoreTab"
        component={MoreStack}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
}