import React from 'react';
import { Pressable, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Tab screens
import HomeScreen from '../screens/mainapp/Home/HomeScreen';
import RecordsScreen from '../screens/mainapp/Records/RecordsScreen';
import LogIntensityStep from '../screens/mainapp/LogAttack/steps/LogIntensityStep';
import InsightsScreen from '../screens/mainapp/Insights/InsightsScreen';
import MoreScreen from '../screens/mainapp/More/MoreScreen';

// Home
import CycleTrackerScreen from '../screens/mainapp/Home/Cycle/CycleTrackerScreen';
import MedicationsScreen from '../screens/mainapp/Home/Medication/MedicationsScreen';
import MedicationFormScreen from '../screens/mainapp/Home/Medication/MedicationFormScreen';
import EducationalContentScreen from '../screens/mainapp/Home/Education/EduContentScreen';
import EducationalArticleScreen from '../screens/mainapp/Home/Education/EduArticleScreen';

// Records
import LogDetailScreen from '../screens/mainapp/Records/LogDetailScreen';

// Log Attack
import { LogDraftProvider } from '../screens/mainapp/LogAttack/LogDraftContext';
import LogTimeStep from '../screens/mainapp/LogAttack/steps/LogTimeStep';
import LogSymptomsStep from '../screens/mainapp/LogAttack/steps/LogSymptomsStep';
import LogTriggersStep from '../screens/mainapp/LogAttack/steps/LogTriggersStep';
import LogMedicationStep from '../screens/mainapp/LogAttack/steps/LogMedicationStep';
import LogNotesStep from '../screens/mainapp/LogAttack/steps/LogNotesStep';
import LogReviewScreen from '../screens/mainapp/LogAttack/LogReviewScreen';

//Insight
import MigraineInsightScreen from '../screens/mainapp/Insights/screens/MigraineInsightScreen';
import CycleInsightScreen from '../screens/mainapp/Insights/screens/CycleInsightScreen';
import MedsInsightScreen from '../screens/mainapp/Insights/screens/MedsInsightScreen';
import TrendsInsightScreen from '../screens/mainapp/Insights/screens/TrendsInsightScreen';

// More
import ManageAccountScreen from '../screens/mainapp/More/ManageAccountScreen';
import NotificationsScreen from '../screens/mainapp/More/NotificationsScreen';
import SharingPermissionsScreen from '../screens/mainapp/More/SharingPermissionsScreen';
import ReportsScreen from '../screens/mainapp/More/ReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stacks (one per tab)

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CycleTracker" component={CycleTrackerScreen} />
      <Stack.Screen name="MedicationsList" component={MedicationsScreen} />
      <Stack.Screen name="MedicationForm" component={MedicationFormScreen} />
      <Stack.Screen name="EducationalContent" component={EducationalContentScreen} />
      <Stack.Screen name="EducationalArticle" component={EducationalArticleScreen} />
    </Stack.Navigator>
  );
}

function RecordsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecordsMain" component={RecordsScreen} />
      <Stack.Screen name="LogDetail" component={LogDetailScreen} />
    </Stack.Navigator>
  );
}

function LogStack() {
  return (
    <LogDraftProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LogMain" component={LogIntensityStep} />
        <Stack.Screen name="LogIntensityStep" component={LogIntensityStep} />
        <Stack.Screen name="LogTimeStep" component={LogTimeStep} />
        <Stack.Screen name="LogSymptomsStep" component={LogSymptomsStep} />
        <Stack.Screen name="LogTriggersStep" component={LogTriggersStep} />
        <Stack.Screen name="LogMedicationStep" component={LogMedicationStep} />
        <Stack.Screen name="LogNotesStep" component={LogNotesStep} />
        <Stack.Screen name="LogReview" component={LogReviewScreen} />
      </Stack.Navigator>
    </LogDraftProvider>
  );
}

function InsightsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InsightsMain" component={InsightsScreen} />
      <Stack.Screen name="MigraineInsight" component={MigraineInsightScreen} />
      <Stack.Screen name="CycleInsight" component={CycleInsightScreen} />
      <Stack.Screen name="MedsInsight" component={MedsInsightScreen} />
      <Stack.Screen name="TrendsInsight" component={TrendsInsightScreen} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="ManageAccount" component={ManageAccountScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SharingPermissions" component={SharingPermissionsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

// FAB (raised center button)

function LogTabButton({ onPress, accessibilityState }) {
  const focused = accessibilityState?.selected;
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -40,
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? '#472376' : '#ad89dc',
          shadowColor: '#ad89dc',
          shadowOpacity: 0.5,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        }}
      >
        <MaterialCommunityIcons 
          name="flash" 
          size={32} 
          color="#11081b" 
          style={{ lineHeight: 32, textAlign: 'center', marginTop: 4 }}/>
      </Pressable>
    </View>
  );
}

// Main Tab Navigator

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  const TAB_ICONS = {
    HomeTab: 'home-outline',
    RecordsTab: 'calendar-blank-outline',
    LogTab: 'flash',
    InsightsTab: 'chart-line',
    MoreTab: 'dots-horizontal',
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
          // Subtle shadow for the floating feel (iOS)
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
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="RecordsTab"
        component={RecordsStack}
        options={{ title: 'Records' }}
      />
      <Tab.Screen
        name="LogTab"
        component={LogStack}
        options={{
          title: '',
          tabBarButton: (props) => <LogTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="InsightsTab"
        component={InsightsStack}
        options={{ title: 'Insights' }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
}