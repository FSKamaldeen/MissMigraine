// Main App for the User (Women with Migraine)

// Imports

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import WelcomeSection from './WelcomeSection';
import { createDefaultOnboardingState, deriveDisplayName, getPersonalizationMessage } from './onboardingConfig';

// Dummy data and constants for the app

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const USER_NAME = 'Ava';
const DEFAULT_ONBOARDING_STATE = createDefaultOnboardingState('');
const DEFAULT_ACCOUNT_PROFILE = {
  fullName: 'Ava Thompson',
  preferredName: 'Ava',
  email: 'ava@example.com',
  cycleLengthAvg: '28',
  cycleRegularity: 'regular',
  auraPresent: true,
  ageOfOnset: '17',
  avgFrequency: '4',
  avgIntensity: 7,
  commonSymptoms: ['Nausea', 'Photophobia', 'Fatigue'],
  dataSharingConsent: false,
  notificationPreferences: {
    loggingReminders: true,
    cycleReminders: true,
    weatherAlerts: false,
  },
  onboardingCompleted: true,
};
const SHARING_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SHARING_DEFAULT_CODE = 'X7K-9P2-LM4';
const SHARING_ACCESS_LEVELS = [
  {
    key: 'full',
    label: 'Full Access',
    description: 'Can view all migraine logs, insights, and cycle data',
    permissions: {
      viewLogs: true,
      viewCycle: true,
      viewInsights: true,
      emergencyAlerts: true,
    },
  },
  {
    key: 'limited',
    label: 'Limited Access',
    description: 'Can view only summary insights and emergency alerts',
    permissions: {
      viewLogs: false,
      viewCycle: false,
      viewInsights: true,
      emergencyAlerts: true,
    },
  },
  {
    key: 'emergency',
    label: 'Emergency Only',
    description: 'Can view only emergency alerts and severity levels',
    permissions: {
      viewLogs: false,
      viewCycle: false,
      viewInsights: false,
      emergencyAlerts: true,
    },
  },
];
const EDUCATION_ARTICLES = [
  {
    id: 'cycle-hormone-link',
    category: 'Cycle & Migraine',
    icon: 'calendar-heart',
    title: 'How hormone shifts can affect migraine patterns',
    subtitle: 'Understand why some phases feel more sensitive and how to plan ahead.',
    readTime: '5 min read',
    lastUpdated: 'Jul 2026',
    keyTakeaway: 'Tracking your cycle and symptoms together can reveal predictable high-risk days.',
    sections: [
      {
        heading: 'What changes through the month',
        body: 'Estrogen and progesterone naturally rise and fall across menstrual, follicular, ovulatory, and luteal phases. Some people are more sensitive to these shifts, especially near period start.',
      },
      {
        heading: 'When attacks are commonly seen',
        body: 'A common pattern is more attacks in the late luteal and early menstrual window. If that matches your pattern, planning hydration, sleep, and medication discussions earlier can help.',
      },
    ],
    practicalTips: [
      'Use your cycle tracker daily for 2-3 months to identify repeat patterns.',
      'Keep rescue medication and comfort tools ready before your higher-risk days.',
      'Share recurring cycle-linked attacks with your clinician.',
    ],
  },
  {
    id: 'medication-basics',
    category: 'Medications',
    icon: 'pill',
    title: 'Medication basics: acute vs preventive treatment',
    subtitle: 'A simple guide to timing, consistency, and follow-up conversations.',
    readTime: '6 min read',
    lastUpdated: 'Jul 2026',
    keyTakeaway: 'The right medicine at the right time can reduce attack severity and duration.',
    sections: [
      {
        heading: 'Acute treatment',
        body: 'Acute medications are used when an attack starts. Early use can improve outcomes for many people. Track response time and side effects so your care plan can be fine-tuned.',
      },
      {
        heading: 'Preventive treatment',
        body: 'Preventive medications are taken regularly to reduce frequency or severity over time. Consistency and follow-up with your provider are key.',
      },
    ],
    practicalTips: [
      'Log what you took, when you took it, and if it helped within 1-2 hours.',
      'Track side effects so your care team can adjust safely.',
      'Do not change doses without medical guidance.',
    ],
  },
  {
    id: 'trigger-patterns',
    category: 'Triggers',
    icon: 'weather-windy',
    title: 'Spotting trigger patterns without overwhelm',
    subtitle: 'Use small, consistent logs to connect stress, sleep, weather, and food.',
    readTime: '4 min read',
    lastUpdated: 'Jul 2026',
    keyTakeaway: 'You do not need perfect data; consistent short logs are enough to detect trends.',
    sections: [
      {
        heading: 'Common trigger clusters',
        body: 'Triggers often combine: poor sleep + stress, or weather change + dehydration. Looking for combinations is usually more useful than a single trigger.',
      },
      {
        heading: 'How to review patterns',
        body: 'Check your recent logs weekly and look for repeated conditions before moderate or severe attacks.',
      },
    ],
    practicalTips: [
      'Start with 3-5 common triggers and expand only if needed.',
      'Use your records list to compare severe vs mild days.',
      'Focus on routines you can control: sleep, hydration, and regular meals.',
    ],
  },
  {
    id: 'attack-day-plan',
    category: 'Self-Care',
    icon: 'head-alert-outline',
    title: 'A gentle attack-day plan',
    subtitle: 'Simple steps to reduce sensory load and support recovery.',
    readTime: '3 min read',
    lastUpdated: 'Jul 2026',
    keyTakeaway: 'A repeatable plan reduces decision fatigue during attacks.',
    sections: [
      {
        heading: 'First 20 minutes',
        body: 'Move to a calm, dark space if possible. Hydrate, reduce screen exposure, and start your usual approved acute plan.',
      },
      {
        heading: 'Recovery window',
        body: 'After pain improves, ease back into activity gradually. Note what helped and what did not.',
      },
    ],
    practicalTips: [
      'Keep a small migraine kit ready in one place.',
      'Use quick log first, then complete details later.',
      'Reach out for support when intensity is high or unusual.',
    ],
  },
];

// Cycle Tracking Card data

const CYCLE_PHASE_META = {
  menstrual: { name: 'Menstrual Phase', emoji: '🩸', color: '#d94764' },
  follicular: { name: 'Follicular Phase', emoji: '🌱', color: '#5aa469' },
  ovulatory: { name: 'Ovulatory Phase', emoji: '🌼', color: '#f4a261' },
  luteal: { name: 'Luteal Phase', emoji: '🌙', color: '#8b5fbf' },
};

function padNumber(value) {
  return `${value}`.padStart(2, '0');
}

// Data Sharing Code Generation and Permissions

function generateSharingCode() {
  const groups = [];
  for (let groupIndex = 0; groupIndex < 3; groupIndex += 1) {
    let group = '';
    for (let charIndex = 0; charIndex < 3; charIndex += 1) {
      const randomIndex = Math.floor(Math.random() * SHARING_CODE_CHARACTERS.length);
      group += SHARING_CODE_CHARACTERS[randomIndex];
    }
    groups.push(group);
  }
  return groups.join('-');
}

function getPermissionsForAccessLevel(accessLevelKey) {
  const match = SHARING_ACCESS_LEVELS.find((item) => item.key === accessLevelKey);
  return match ? { ...match.permissions } : { ...SHARING_ACCESS_LEVELS[1].permissions };
}

function createInitialTrustedPersons() {
  return [
    {
      id: 'trusted-1',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      status: 'active',
      accessLevelKey: 'full',
      permissions: getPermissionsForAccessLevel('full'),
    },
    {
      id: 'trusted-2',
      name: 'Sarah Lee',
      email: 'sarah@example.com',
      status: 'active',
      accessLevelKey: 'limited',
      permissions: getPermissionsForAccessLevel('limited'),
    },
  ];
}

function deriveTrustedPersonName(emailValue, index) {
  const trimmedEmail = (emailValue || '').trim();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return `Trusted Person ${index}`;
  }
  const localPart = trimmedEmail.split('@')[0];
  const cleaned = localPart
    .replace(/[._-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  if (!cleaned) {
    return `Trusted Person ${index}`;
  }
  return cleaned
    .split(' ')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

// Cycle Tracking Utilities

function toDateInputValue(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function parseInputDate(value) {
  if (!value) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  const parsedDate = new Date(year, month - 1, day);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function atStartOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function differenceInDays(startDate, endDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((atStartOfDay(endDate).getTime() - atStartOfDay(startDate).getTime()) / msPerDay);
}

function formatLongDate(value) {
  const parsedDate = parseInputDate(value);
  if (!parsedDate) {
    return 'Not set';
  }
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCycleSegments(cycleLength, ovulationDayValue) {
  const menstrualEnd = Math.min(5, cycleLength);
  const parsedOvulationDay = Number.parseInt(ovulationDayValue, 10);
  const safeOvulationDay = Number.isFinite(parsedOvulationDay)
    ? Math.min(Math.max(parsedOvulationDay, menstrualEnd + 1), cycleLength)
    : Math.min(Math.max(cycleLength - 14, menstrualEnd + 1), cycleLength);
  const ovulationStart = Math.max(menstrualEnd + 1, safeOvulationDay - 1);
  const ovulationEnd = Math.min(cycleLength, safeOvulationDay + 1);
  const follicularLength = Math.max(0, ovulationStart - (menstrualEnd + 1));
  const lutealLength = Math.max(0, cycleLength - ovulationEnd);

  return [
    { key: 'menstrual', 
      label: 'Menstrual', 
      color: '#d94764', 
      length: menstrualEnd, 
      startDay: 1, 
      endDay: menstrualEnd },
    {
      key: 'follicular',
      label: 'Follicular',
      color: '#5aa469',
      length: follicularLength,
      startDay: menstrualEnd + 1,
      endDay: ovulationStart - 1,
    },
    {
      key: 'ovulatory',
      label: 'Ovulatory',
      color: '#f4a261',
      length: Math.max(0, ovulationEnd - ovulationStart + 1),
      startDay: ovulationStart,
      endDay: ovulationEnd,
    },
    { key: 'luteal', 
      label: 'Luteal', 
      color: '#8b5fbf', 
      length: lutealLength, 
      startDay: ovulationEnd + 1, 
      endDay: cycleLength },
  ].filter((segment) => segment.length > 0);
}

function getCycleSummary(cycleData, referenceDate = new Date(), phaseOverrides = {}) {
  if (!cycleData?.lastPeriodStartDate) {
    return null;
  }

  const startDate = parseInputDate(cycleData.lastPeriodStartDate);
  if (!startDate) {
    return null;
  }

  const cycleLength = Math.max(1, Number.parseInt(cycleData.averageCycleLength, 10) || 28);
  const daysSinceStart = differenceInDays(startDate, referenceDate);
  const normalizedDayIndex = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;
  const dayInCycle = normalizedDayIndex + 1;
  const cycleStartThisRound = addDays(startDate, daysSinceStart - normalizedDayIndex);
  const nextPeriodDate = addDays(cycleStartThisRound, cycleLength);
  const perimenstrualStartDate = addDays(nextPeriodDate, -2);
  const perimenstrualEndDate = addDays(nextPeriodDate, 3);
  const currentDateKey = toDateInputValue(atStartOfDay(referenceDate));
  const isPerimenstrualWindow =
    atStartOfDay(referenceDate).getTime() >= atStartOfDay(perimenstrualStartDate).getTime() &&
    atStartOfDay(referenceDate).getTime() <= atStartOfDay(perimenstrualEndDate).getTime();
  const segments = getCycleSegments(cycleLength, cycleData.ovulationDay);

  let phaseKey = 'luteal';
  for (const segment of segments) {
    if (dayInCycle >= segment.startDay && dayInCycle <= segment.endDay) {
      phaseKey = segment.key;
      break;
    }
  }

  if (phaseOverrides[currentDateKey]) {
    phaseKey = phaseOverrides[currentDateKey];
  }

  return {
    phaseKey,
    phase: CYCLE_PHASE_META[phaseKey],
    dayInCycle,
    cycleLength,
    isPerimenstrualWindow,
    nextPeriodDate: toDateInputValue(nextPeriodDate),
    perimenstrualStartDate: toDateInputValue(perimenstrualStartDate),
    perimenstrualEndDate: toDateInputValue(perimenstrualEndDate),
    ovulationDay: Number.parseInt(cycleData.ovulationDay, 10) || Math.min(Math.max(cycleLength - 14, 1), cycleLength),
    segments,
  };
}

function createInitialCycleData() {
  const today = new Date();
  const lastStart = addDays(today, -23);
  const lastEnd = addDays(today, -19);

  return {
    lastPeriodStartDate: toDateInputValue(lastStart),
    lastPeriodEndDate: toDateInputValue(lastEnd),
    averageCycleLength: '28',
    ovulationDay: '14',
    notes: 'Mock entry: symptoms often feel more sensitive during the perimenstrual window.',
  };
}

// Cycle History Data

function createInitialCycleHistory() {
  const latestCycle = createInitialCycleData();
  const latestStart = parseInputDate(latestCycle.lastPeriodStartDate);

  return [
    {
      id: 'cycle-current',
      periodStart: latestCycle.lastPeriodStartDate,
      periodEnd: latestCycle.lastPeriodEndDate,
      cycleLength: 28,
      ovulationDay: 14,
      perimenstrualStart: toDateInputValue(addDays(addDays(latestStart, 28), -2)),
      perimenstrualEnd: toDateInputValue(addDays(addDays(latestStart, 28), 3)),
      notes: 'Current mock cycle',
    },
    {
      id: 'cycle-previous-1',
      periodStart: toDateInputValue(addDays(latestStart, -28)),
      periodEnd: toDateInputValue(addDays(latestStart, -24)),
      cycleLength: 28,
      ovulationDay: 14,
      perimenstrualStart: toDateInputValue(addDays(latestStart, -2)),
      perimenstrualEnd: toDateInputValue(addDays(latestStart, 3)),
      notes: 'Steady mock cycle',
    },
    {
      id: 'cycle-previous-2',
      periodStart: toDateInputValue(addDays(latestStart, -56)),
      periodEnd: toDateInputValue(addDays(latestStart, -52)),
      cycleLength: 27,
      ovulationDay: 13,
      perimenstrualStart: toDateInputValue(addDays(addDays(latestStart, -28), -2)),
      perimenstrualEnd: toDateInputValue(addDays(addDays(latestStart, -28), 3)),
      notes: 'Slightly shorter cycle',
    },
  ];
}

function rotateArray(values, offset) {
  if (!values.length) {
    return values;
  }
  const normalizedOffset = ((offset % values.length) + values.length) % values.length;
  if (normalizedOffset === 0) {
    return values;
  }
  return [...values.slice(values.length - normalizedOffset), ...values.slice(0, values.length - normalizedOffset)];
}

function buildActivityCalendar(template, monthOffset) {
  if (!template.length || !template[0]?.length) {
    return template;
  }
  const columns = template[0].length;
  const flatTemplate = template.flat();
  const rotated = rotateArray(flatTemplate, monthOffset * 3);
  const remapped = rotated.map((value, index) => {
    const variance = (Math.abs(monthOffset) + index) % 4;
    if (variance === 0 && value < 2) {
      return value + 1;
    }
    if (variance === 3 && value > 0) {
      return value - 1;
    }
    return value;
  });

  return Array.from({ length: template.length }, (_, rowIndex) =>
    remapped.slice(rowIndex * columns, (rowIndex + 1) * columns)
  );
}

function formatDateTimeLabel(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }
  return parsedDate.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).replace(',', ' ·');
}

function createInitialMigraineLogs() {
  const now = new Date();
  const entries = [
    { id: 'log-001', dayOffset: 1, hour: 21, minute: 30, intensity: 8, durationHours: 4.5, symptoms: ['Nausea', 'Photophobia', 'Aura'], cyclePhaseKey: 'luteal', cycleDay: 24, auraPresent: true, triggers: ['Stress', 'Hormonal'], medications: ['Sumatriptan'], notes: 'Evening attack after a stressful day.' },
    { id: 'log-002', dayOffset: 3, hour: 10, minute: 0, intensity: 7, durationHours: 3.5, symptoms: ['Photophobia', 'Fatigue'], cyclePhaseKey: 'luteal', cycleDay: 22, auraPresent: false, triggers: ['Sleep Deprivation'], medications: ['Ibuprofen'], notes: 'Started mid-morning and improved with rest.' },
    { id: 'log-003', dayOffset: 6, hour: 14, minute: 15, intensity: 6, durationHours: 2.5, symptoms: ['Dizziness', 'Nausea'], cyclePhaseKey: 'ovulatory', cycleDay: 15, auraPresent: false, triggers: ['Weather Change'], medications: ['Naproxen'], notes: 'Mild dizziness with pressure drop.' },
    { id: 'log-004', dayOffset: 8, hour: 7, minute: 40, intensity: 9, durationHours: 6, symptoms: ['Aura', 'Photophobia', 'Phonophobia'], cyclePhaseKey: 'menstrual', cycleDay: 2, auraPresent: true, triggers: ['Hormonal', 'Sleep Deprivation'], medications: ['Sumatriptan', 'Ibuprofen'], notes: 'Strong morning onset during period.' },
    { id: 'log-005', dayOffset: 11, hour: 18, minute: 20, intensity: 5, durationHours: 2, symptoms: ['Fatigue'], cyclePhaseKey: 'follicular', cycleDay: 8, auraPresent: false, triggers: ['Stress'], medications: ['Hydration + rest'], notes: 'Short episode after long meeting.' },
    { id: 'log-006', dayOffset: 14, hour: 12, minute: 5, intensity: 7, durationHours: 4, symptoms: ['Nausea', 'Photophobia'], cyclePhaseKey: 'luteal', cycleDay: 20, auraPresent: false, triggers: ['Hormonal', 'Weather Change'], medications: ['Sumatriptan'], notes: 'Typical pre-period pattern.' },
    { id: 'log-007', dayOffset: 17, hour: 9, minute: 30, intensity: 4, durationHours: 1.5, symptoms: ['Fatigue'], cyclePhaseKey: 'follicular', cycleDay: 10, auraPresent: false, triggers: ['Skipped meal'], medications: ['Snack + water'], notes: 'Resolved quickly after meal.' },
    { id: 'log-008', dayOffset: 20, hour: 22, minute: 10, intensity: 8, durationHours: 5, symptoms: ['Aura', 'Nausea'], cyclePhaseKey: 'menstrual', cycleDay: 1, auraPresent: true, triggers: ['Hormonal', 'Stress'], medications: ['Sumatriptan'], notes: 'First day of period with aura.' },
    { id: 'log-009', dayOffset: 24, hour: 16, minute: 55, intensity: 6, durationHours: 3, symptoms: ['Photophobia'], cyclePhaseKey: 'ovulatory', cycleDay: 14, auraPresent: false, triggers: ['Screen time'], medications: ['Naproxen'], notes: 'Likely triggered by extended laptop use.' },
    { id: 'log-010', dayOffset: 28, hour: 11, minute: 45, intensity: 7, durationHours: 4.2, symptoms: ['Nausea', 'Fatigue'], cyclePhaseKey: 'luteal', cycleDay: 23, auraPresent: false, triggers: ['Stress', 'Sleep Deprivation'], medications: ['Sumatriptan'], notes: 'Recovered after hydration and quiet room.' },
    { id: 'log-011', dayOffset: 33, hour: 6, minute: 50, intensity: 8, durationHours: 5.5, symptoms: ['Aura', 'Photophobia', 'Phonophobia'], cyclePhaseKey: 'menstrual', cycleDay: 3, auraPresent: true, triggers: ['Hormonal'], medications: ['Sumatriptan'], notes: 'Severe early-morning migraine.' },
    { id: 'log-012', dayOffset: 38, hour: 13, minute: 25, intensity: 5, durationHours: 2.3, symptoms: ['Dizziness'], cyclePhaseKey: 'follicular', cycleDay: 9, auraPresent: false, triggers: ['Weather Change'], medications: ['Ibuprofen'], notes: 'Pressure shift day.' },
    { id: 'log-013', dayOffset: 43, hour: 19, minute: 35, intensity: 7, durationHours: 3.8, symptoms: ['Nausea', 'Photophobia'], cyclePhaseKey: 'luteal', cycleDay: 21, auraPresent: false, triggers: ['Stress', 'Late caffeine'], medications: ['Naproxen'], notes: 'Started after late coffee.' },
    { id: 'log-014', dayOffset: 49, hour: 15, minute: 10, intensity: 6, durationHours: 3.1, symptoms: ['Fatigue', 'Photophobia'], cyclePhaseKey: 'ovulatory', cycleDay: 13, auraPresent: false, triggers: ['Skipped water'], medications: ['Hydration + rest'], notes: 'Moderate afternoon episode.' },
  ];

  return entries.map((entry) => {
    const loggedDate = new Date(now);
    loggedDate.setDate(now.getDate() - entry.dayOffset);
    loggedDate.setHours(entry.hour, entry.minute, 0, 0);
    return {
      ...entry,
      dateTime: loggedDate.toISOString(),
    };
  });
}

function buildRecordsCalendarWeeks(monthDate, logsByDate) {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const mondayStartOffset = (monthStart.getDay() + 6) % 7;
  const cells = [];
  const todayKey = toDateInputValue(new Date());

  for (let index = 0; index < mondayStartOffset; index += 1) {
    cells.push({ key: `empty-start-${index}`, empty: true });
  }

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const dateKey = toDateInputValue(cellDate);
    const logCount = logsByDate[dateKey] || 0;
    cells.push({
      key: `day-${dateKey}`,
      empty: false,
      dayNumber: day,
      dateKey,
      hasLogs: logCount > 0,
      logCount,
      isToday: todayKey === dateKey,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `empty-end-${cells.length}`, empty: true });
  }

  const weeks = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return {
    monthLabel: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    weeks,
  };
}

// Home Screen Component

function HomeScreen({
  navigation,
  route,
  cycleData,
  setCycleData,
  phaseOverrides = {},
  setPhaseOverrides,
  onboardingState: onboardingStateProp,
  showPostSignupWelcome: showPostSignupWelcomeProp,
}) {
  const onboardingState = onboardingStateProp || route.params?.onboardingState || DEFAULT_ONBOARDING_STATE;
  const showPostSignupWelcome = typeof showPostSignupWelcomeProp === 'boolean'
    ? showPostSignupWelcomeProp
    : Boolean(route.params?.showPostSignupWelcome);
  const hasOnboardingContext = Boolean(showPostSignupWelcome || onboardingState.email);
  const isProfileComplete = Boolean(onboardingState.completed && !onboardingState.skipped);
  const homeDisplayName = deriveDisplayName(onboardingState.email, USER_NAME);
  const personalizationMessage = getPersonalizationMessage(6, onboardingState.answers || DEFAULT_ONBOARDING_STATE.answers);
  const cycleSummary = getCycleSummary(cycleData, new Date(), phaseOverrides);
  const todayCycleDateKey = toDateInputValue(new Date());
  const [showQuickPhaseEditor, setShowQuickPhaseEditor] = useState(false);
  const activeHomePhaseKey = cycleSummary ? phaseOverrides[todayCycleDateKey] || cycleSummary.phaseKey : null;

  const saveTodayPhaseOverride = (phaseKey) => {
    if (typeof setPhaseOverrides !== 'function') {
      return;
    }
    setPhaseOverrides((prev) => ({ ...prev, [todayCycleDateKey]: phaseKey }));
  };

  const applyHomePhaseUpdate = (phaseKey) => {
    if (!cycleSummary) {
      Alert.alert('Set up cycle first', 'Please add your cycle details first, then you can update your daily phase.');
      return;
    }

    saveTodayPhaseOverride(phaseKey);

    if (phaseKey !== 'menstrual') {
      Alert.alert('Phase updated', `Today is marked as ${CYCLE_PHASE_META[phaseKey].name}.`);
      return;
    }

    Alert.alert(
      'Period started today?',
      'If your period started earlier than predicted, update your cycle start date to today so future predictions stay accurate.',
      [
        { text: 'Keep as phase only', style: 'cancel' },
        {
          text: 'Yes, update cycle',
          onPress: () => {
            if (typeof setCycleData === 'function') {
              setCycleData((prev) => ({
                ...prev,
                lastPeriodStartDate: todayCycleDateKey,
                lastPeriodEndDate: '',
              }));
            }
            saveTodayPhaseOverride('menstrual');
            Alert.alert('Cycle updated', 'Today is now your cycle start, and upcoming predictions were adjusted.');
          },
        },
      ]
    );
  };

  const handleCompleteProfile = () => {
    navigation.getParent()?.getParent()?.navigate('Onboarding', {
      email: onboardingState.email,
      onboardingState,
      initialStep: onboardingState.firstUnansweredStep || 1,
      frontendOnly: true,
      showPostSignupWelcome,
    });
  };

  // Common Symptoms and Triggers State

  const [commonSymptoms, setCommonSymptoms] = useState([
    { id: 'home-sym-1', name: 'Nausea' },
    { id: 'home-sym-2', name: 'Photophobia' },
    { id: 'home-sym-3', name: 'Fatigue' },
  ]);
  const [commonTriggers, setCommonTriggers] = useState([
    { id: 'home-trig-1', name: 'Stress' },
    { id: 'home-trig-2', name: 'Sleep' },
    { id: 'home-trig-3', name: 'Weather' },
  ]);
  const [editingCommonSymptoms, setEditingCommonSymptoms] = useState(false);
  const [editingCommonTriggers, setEditingCommonTriggers] = useState(false);
  const [newCommonSymptom, setNewCommonSymptom] = useState('');
  const [newCommonTrigger, setNewCommonTrigger] = useState('');

  // Medication Management State

  const [medications, setMedications] = useState([
    {
      id: 'med-1',
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'As needed',
      startDate: '2026-07-01',
      endDate: '',
      reminderEnabled: true,
      reminderTime: '08:00',
      intakeLogs: [],
    },
  ]);
  const [medFormMode, setMedFormMode] = useState(null);
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    reminderEnabled: true,
    reminderTime: '08:00',
  });
  const [intakeDraft, setIntakeDraft] = useState(null);

  const resetMedicationForm = () => {
    setMedForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      reminderEnabled: true,
      reminderTime: '08:00',
    });
    setEditingMedicationId(null);
    setMedFormMode(null);
  };

  const openMedicationAdd = () => {
    setEditingMedicationId(null);
    setMedFormMode('add');
    setMedForm({
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      reminderEnabled: true,
      reminderTime: '08:00',
    });
  };

  const openMedicationEdit = (medication) => {
    setEditingMedicationId(medication.id);
    setMedFormMode('edit');
    setMedForm({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate,
      endDate: medication.endDate || '',
      reminderEnabled: medication.reminderEnabled,
      reminderTime: medication.reminderTime,
    });
  };

  const saveMedication = () => {
    if (!medForm.name.trim() || !medForm.dosage.trim() || !medForm.frequency.trim() || !medForm.startDate.trim()) {
      Alert.alert('Required', 'Please fill name, dosage, frequency, and start date.');
      return;
    }

    if (medFormMode === 'edit' && editingMedicationId) {
      setMedications((prev) =>
        prev.map((med) =>
          med.id === editingMedicationId
            ? {
                ...med,
                ...medForm,
              }
            : med
        )
      );
      Alert.alert('Updated', 'Medication updated (dummy data).');
      resetMedicationForm();
      return;
    }

    const newMedication = {
      id: `med-${Date.now()}`,
      ...medForm,
      intakeLogs: [],
    };
    setMedications((prev) => [...prev, newMedication]);
    Alert.alert('Saved', 'Medication added (dummy data).');
    resetMedicationForm();
  };

  const deleteMedication = (medicationId) => {
    setMedications((prev) => prev.filter((med) => med.id !== medicationId));
  };

  const openIntakeLog = (medicationId) => {
    setIntakeDraft({
      medicationId,
      confirmed: true,
      effectivenessRating: 3,
      afterMinutes: '90',
      sideEffectsOccurred: false,
      notes: '',
    });
  };

  // Simulated reminder trigger

  const triggerReminder = (medication) => {
    Alert.alert(
      'Reminder',
      `${medication.name} reminder (${medication.reminderTime}). Confirm intake below.`
    );
    openIntakeLog(medication.id);
  };

  const saveIntakeLog = () => {
    if (!intakeDraft) {
      return;
    }
    if (!intakeDraft.afterMinutes.trim()) {
      Alert.alert('Required', 'Please set effectiveness check time (minutes).');
      return;
    }

    const logEntry = {
      id: `intake-${Date.now()}`,
      takenAt: new Date().toISOString(),
      confirmed: intakeDraft.confirmed,
      effectivenessRating: intakeDraft.effectivenessRating,
      afterMinutes: intakeDraft.afterMinutes,
      sideEffectsOccurred: intakeDraft.sideEffectsOccurred,
      notes: intakeDraft.notes.trim(),
    };

    setMedications((prev) =>
      prev.map((med) =>
        med.id === intakeDraft.medicationId ? { ...med, intakeLogs: [...med.intakeLogs, logEntry] } : med
      )
    );
    setIntakeDraft(null);
    Alert.alert('Saved', 'Medication intake logged (dummy).');
  };

  const selectedMedication = intakeDraft
    ? medications.find((med) => med.id === intakeDraft.medicationId)
    : null;

  const addCommonItem = (type) => {
    const isSymptom = type === 'symptom';
    const value = (isSymptom ? newCommonSymptom : newCommonTrigger).trim();
    if (!value) {
      Alert.alert('Required', `Please enter a ${type}.`);
      return;
    }

    if (isSymptom) {
      const exists = commonSymptoms.some((item) => item.name.toLowerCase() === value.toLowerCase());
      if (exists) {
        Alert.alert('Already exists', 'That symptom is already in common symptoms.');
        return;
      }
      setCommonSymptoms((prev) => [...prev, { id: `home-sym-${Date.now()}`, name: value }]);
      setNewCommonSymptom('');
      return;
    }

    const exists = commonTriggers.some((item) => item.name.toLowerCase() === value.toLowerCase());
    if (exists) {
      Alert.alert('Already exists', 'That trigger is already in common triggers.');
      return;
    }
    setCommonTriggers((prev) => [...prev, { id: `home-trig-${Date.now()}`, name: value }]);
    setNewCommonTrigger('');
  };

  const deleteCommonItem = (type, itemId) => {
    if (type === 'symptom') {
      setCommonSymptoms((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setCommonTriggers((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <WelcomeSection userName={homeDisplayName} />

        {hasOnboardingContext && (
          <View style={styles.onboardingStatusCard}>
            <Text style={styles.onboardingStatusTitle}>
              {isProfileComplete ? `Welcome, ${homeDisplayName}!` : 'Welcome to MissMigraine!'}
            </Text>
            <Text style={styles.onboardingStatusSubtitle}>
              {isProfileComplete
                ? personalizationMessage
                : 'Complete your profile to get personalised insights based on your migraine patterns.'}
            </Text>
            {!isProfileComplete && (
              <Pressable
                style={({ pressed }) => [styles.completeProfileButton, pressed && styles.completeProfileButtonPressed]}
                onPress={handleCompleteProfile}
              >
                <MaterialCommunityIcons name="account-edit-outline" size={18} color="#ffffff" />
                <Text style={styles.completeProfileButtonText}>Complete Profile</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.homeCycleCard}>
          <Pressable
            style={({ pressed }) => [styles.homeCycleMainPressable, pressed && styles.homeCycleCardPressed]}
            onPress={() => navigation.navigate('CycleTracker')}
          >
            {cycleSummary ? (
              <>
                <View style={styles.homeCycleEmojiWrap}>
                  <Text style={styles.homeCycleEmoji}>{cycleSummary.phase.emoji}</Text>
                </View>
                <View style={styles.homeCycleCopy}>
                  <Text style={styles.homeCyclePhase}>{cycleSummary.phase.name}</Text>
                  <Text style={styles.homeCycleDay}>Day {cycleSummary.dayInCycle} of {cycleSummary.cycleLength}</Text>
                  {cycleSummary.isPerimenstrualWindow && (
                    <View style={styles.perimenstrualBadge}>
                      <Text style={styles.perimenstrualBadgeText}>🔴 Perimenstrual Window</Text>
                    </View>
                  )}
                  <Text style={styles.homeCycleLink}>Tap to view details →</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.homeCycleEmojiWrap}>
                  <Text style={styles.homeCycleEmoji}>🌸</Text>
                </View>
                <View style={styles.homeCycleCopy}>
                  <Text style={styles.homeCyclePhase}>No cycle data. Tap to set up.</Text>
                  <Pressable
                    style={({ pressed }) => [styles.setupCycleButton, pressed && styles.completeProfileButtonPressed]}
                    onPress={() => navigation.navigate('CycleTracker')}
                  >
                    <Text style={styles.setupCycleButtonText}>Set Up</Text>
                  </Pressable>
                  <Text style={styles.homeCycleLink}>Tap to view details →</Text>
                </View>
              </>
            )}
          </Pressable>

          {cycleSummary ? (
            <View style={styles.homeCycleQuickEditWrap}>
              <Pressable
                style={({ pressed }) => [styles.homeCycleQuickEditButton, pressed && styles.addButtonPressed]}
                onPress={() => setShowQuickPhaseEditor((prev) => !prev)}
              >
                <MaterialCommunityIcons name="calendar-edit" size={17} color="#ffffff" />
                <Text style={styles.homeCycleQuickEditButtonText}>
                  {showQuickPhaseEditor ? 'Hide phase update' : "Update today's phase"}
                </Text>
              </Pressable>
              {showQuickPhaseEditor ? (
                <>
                  <View style={styles.homeCyclePhaseChipRow}>
                    {Object.entries(CYCLE_PHASE_META).map(([phaseKey, meta]) => (
                      <Pressable
                        key={`home-phase-${phaseKey}`}
                        style={({ pressed }) => [
                          styles.phaseAssignChip,
                          activeHomePhaseKey === phaseKey && { backgroundColor: meta.color, borderColor: meta.color },
                          pressed && styles.addButtonPressed,
                        ]}
                        onPress={() => applyHomePhaseUpdate(phaseKey)}
                      >
                        <View style={[styles.phaseAssignChipDot, { backgroundColor: activeHomePhaseKey === phaseKey ? '#ffffff' : meta.color }]} />
                        <Text style={[styles.phaseAssignChipText, activeHomePhaseKey === phaseKey && styles.phaseAssignChipTextActive]}>
                          {meta.name.replace(' Phase', '')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.homeCycleQuickEditHint}>
                    If your period starts early, choose Menstrual and confirm to shift cycle predictions.
                  </Text>
                </>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Section: Educational Content */}
        <SectionHeader
          icon="lightbulb"
          title="Helpful Resources"
          subtitle="Tips & Resources"
          actionLabel="View all"
          onAction={() => navigation.navigate('EducationalContent')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.homeEducationCarouselRow}>
          {EDUCATION_ARTICLES.map((article) => (
            <Pressable
              key={`home-article-${article.id}`}
              style={({ pressed }) => [styles.homeEducationCarouselCard, pressed && styles.addButtonPressed]}
              onPress={() => navigation.navigate('EducationalArticle', { articleId: article.id })}
            >
              <View style={styles.educationArticleIconWrap}>
                <MaterialCommunityIcons name={article.icon} size={18} color="#7f011f" />
              </View>
              <Text style={styles.homeEducationCarouselCategory}>{article.category}</Text>
              <Text style={styles.homeEducationCarouselTitle}>{article.title}</Text>
              <Text style={styles.homeEducationCarouselSubtitle}>{article.subtitle}</Text>
              <Text style={styles.homeEducationCarouselMeta}>{article.readTime} • Updated {article.lastUpdated}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Section: Tracking */}
        <SectionHeader icon="check-all" title="Track" subtitle="Your health data" />

        {/* Medications */}
        <View style={styles.trackingSection}>
          <View style={styles.trackingHeader}>
            <MaterialCommunityIcons name="pill" size={20} color="#7f011f" />
            <Text style={styles.trackingTitle}>Medications</Text>
          </View>
          {medications.map((medication) => {
            const latestLog =
              medication.intakeLogs.length > 0
                ? medication.intakeLogs[medication.intakeLogs.length - 1]
                : null;

            return (
              <View key={medication.id} style={styles.medicationCard}>
                <View style={styles.medicationTopRow}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationMeta}>{medication.dosage}</Text>
                </View>
                <Text style={styles.medicationDetails}>
                  {medication.frequency} • Start {medication.startDate} • End {medication.endDate || 'Ongoing'}
                </Text>
                <Text style={styles.medicationDetails}>
                  Reminder: {medication.reminderEnabled ? `On at ${medication.reminderTime}` : 'Off'}
                </Text>
                {latestLog ? (
                  <Text style={styles.medicationLogPreview}>
                    Last intake: {latestLog.confirmed ? 'Confirmed' : 'Skipped'} • Effectiveness {latestLog.effectivenessRating}/5
                    {latestLog.sideEffectsOccurred ? ' • Side effects: Yes' : ''}
                  </Text>
                ) : (
                  <Text style={styles.medicationLogPreview}>No intake logs yet</Text>
                )}
                <View style={styles.medicationActions}>
                  <Pressable style={({ pressed }) => [styles.smallGhostButton, pressed && styles.addButtonPressed]} onPress={() => openMedicationEdit(medication)}>
                    <Text style={styles.smallGhostButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.smallGhostButton, pressed && styles.addButtonPressed]} onPress={() => deleteMedication(medication.id)}>
                    <Text style={styles.smallGhostButtonText}>Delete</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.smallPrimaryButton, pressed && styles.smallPrimaryButtonPressed]} onPress={() => triggerReminder(medication)}>
                    <Text style={styles.smallPrimaryButtonText}>Send Reminder</Text>
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.smallPrimaryButton, pressed && styles.smallPrimaryButtonPressed]} onPress={() => openIntakeLog(medication.id)}>
                    <Text style={styles.smallPrimaryButtonText}>Log Intake</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          <Pressable
            style={({ pressed }) => [styles.medicationAddButton, pressed && styles.medicationAddButtonPressed]}
            onPress={openMedicationAdd}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
            <Text style={styles.medicationAddButtonText}>Add Medication</Text>
          </Pressable>

          {medFormMode && (
            <View style={styles.addFormCard}>
              <Text style={styles.addFormTitle}>{medFormMode === 'edit' ? 'Edit Medication' : 'Add Medication'}</Text>
              <TextInput
                style={styles.addFormInput}
                placeholder="Medication name"
                placeholderTextColor="#a0a0a0"
                value={medForm.name}
                onChangeText={(value) => setMedForm((prev) => ({ ...prev, name: value }))}
              />
              <TextInput
                style={styles.addFormInput}
                placeholder="Dosage (e.g., 50mg)"
                placeholderTextColor="#a0a0a0"
                value={medForm.dosage}
                onChangeText={(value) => setMedForm((prev) => ({ ...prev, dosage: value }))}
              />
              <TextInput
                style={styles.addFormInput}
                placeholder="Frequency (e.g., Twice daily)"
                placeholderTextColor="#a0a0a0"
                value={medForm.frequency}
                onChangeText={(value) => setMedForm((prev) => ({ ...prev, frequency: value }))}
              />
              <TextInput
                style={styles.addFormInput}
                placeholder="Start date (YYYY-MM-DD)"
                placeholderTextColor="#a0a0a0"
                value={medForm.startDate}
                onChangeText={(value) => setMedForm((prev) => ({ ...prev, startDate: value }))}
              />
              <TextInput
                style={styles.addFormInput}
                placeholder="End date (YYYY-MM-DD, optional)"
                placeholderTextColor="#a0a0a0"
                value={medForm.endDate}
                onChangeText={(value) => setMedForm((prev) => ({ ...prev, endDate: value }))}
              />
              <TextInput
                style={styles.addFormInput}
                placeholder="Reminder time (HH:MM)"
                placeholderTextColor="#a0a0a0"
                value={medForm.reminderTime}
                onChangeText={(value) => setMedForm((prev) => ({ ...prev, reminderTime: value }))}
              />
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Reminder enabled</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.toggleButton,
                    medForm.reminderEnabled && styles.toggleButtonActive,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => setMedForm((prev) => ({ ...prev, reminderEnabled: !prev.reminderEnabled }))}
                >
                  <Text style={[styles.toggleButtonText, medForm.reminderEnabled && styles.toggleButtonTextActive]}>
                    {medForm.reminderEnabled ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.addFormActions}>
                <Pressable style={({ pressed }) => [styles.addFormCancel, pressed && styles.addFormCancelPressed]} onPress={resetMedicationForm}>
                  <Text style={styles.addFormCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.addFormSave, pressed && styles.addFormSavePressed]} onPress={saveMedication}>
                  <Text style={styles.addFormSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}

          {intakeDraft && selectedMedication && (
            <View style={styles.addFormCard}>
              <Text style={styles.addFormTitle}>Log Intake • {selectedMedication.name}</Text>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Did you take it?</Text>
                <View style={styles.binaryButtonsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.binaryButton,
                      intakeDraft.confirmed && styles.binaryButtonActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => setIntakeDraft((prev) => ({ ...prev, confirmed: true }))}
                  >
                    <Text style={[styles.binaryButtonText, intakeDraft.confirmed && styles.binaryButtonTextActive]}>Yes</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.binaryButton,
                      !intakeDraft.confirmed && styles.binaryButtonActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => setIntakeDraft((prev) => ({ ...prev, confirmed: false }))}
                  >
                    <Text style={[styles.binaryButtonText, !intakeDraft.confirmed && styles.binaryButtonTextActive]}>No</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.medicationFieldLabel}>Effectiveness</Text>
              <View style={styles.effectivenessRow}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <Pressable
                    key={score}
                    style={({ pressed }) => [
                      styles.effectivenessButton,
                      intakeDraft.effectivenessRating === score && styles.effectivenessButtonActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => setIntakeDraft((prev) => ({ ...prev, effectivenessRating: score }))}
                  >
                    <Text style={[styles.effectivenessButtonText, intakeDraft.effectivenessRating === score && styles.effectivenessButtonTextActive]}>
                      {score}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Side effects occurred</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.toggleButton,
                    intakeDraft.sideEffectsOccurred && styles.toggleButtonActive,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => setIntakeDraft((prev) => ({ ...prev, sideEffectsOccurred: !prev.sideEffectsOccurred }))}
                >
                  <Text style={[styles.toggleButtonText, intakeDraft.sideEffectsOccurred && styles.toggleButtonTextActive]}>
                    {intakeDraft.sideEffectsOccurred ? 'Yes' : 'No'}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                style={styles.addFormInput}
                placeholder="Effectiveness check after (minutes)"
                placeholderTextColor="#a0a0a0"
                keyboardType="number-pad"
                value={intakeDraft.afterMinutes}
                onChangeText={(value) => setIntakeDraft((prev) => ({ ...prev, afterMinutes: value }))}
              />
              <TextInput
                style={[styles.addFormInput, styles.addFormDetailsInput]}
                placeholder="Optional notes"
                placeholderTextColor="#a0a0a0"
                value={intakeDraft.notes}
                onChangeText={(value) => setIntakeDraft((prev) => ({ ...prev, notes: value }))}
                multiline
                numberOfLines={2}
              />
              <View style={styles.addFormActions}>
                <Pressable
                  style={({ pressed }) => [styles.addFormCancel, pressed && styles.addFormCancelPressed]}
                  onPress={() => setIntakeDraft(null)}
                >
                  <Text style={styles.addFormCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.addFormSave, pressed && styles.addFormSavePressed]} onPress={saveIntakeLog}>
                  <Text style={styles.addFormSaveText}>Save Intake</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Common Triggers */}
        <View style={styles.trackingSection}>
          <View style={styles.trackingHeader}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#ff727b" />
            <Text style={styles.trackingTitle}>Common Triggers</Text>
            <Pressable
              style={({ pressed }) => [styles.smallGhostButton, styles.sectionEditButton, pressed && styles.addButtonPressed]}
              onPress={() => setEditingCommonTriggers((prev) => !prev)}
            >
              <Text style={styles.smallGhostButtonText}>{editingCommonTriggers ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>
          <View style={styles.tagsContainer}>
            {commonTriggers.map((trigger) => (
              <View key={trigger.id} style={styles.tag}>
                <Text style={styles.tagText}>{trigger.name}</Text>
                {editingCommonTriggers && (
                  <Pressable onPress={() => deleteCommonItem('trigger', trigger.id)}>
                    <MaterialCommunityIcons name="close" size={14} color="#ff727b" />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
          {editingCommonTriggers && (
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Add common trigger"
                placeholderTextColor="#a0a0a0"
                value={newCommonTrigger}
                onChangeText={setNewCommonTrigger}
              />
              <Pressable
                style={({ pressed }) => [styles.inlineAddButton, pressed && styles.addButtonPressed]}
                onPress={() => addCommonItem('trigger')}
              >
                <Text style={styles.inlineAddButtonText}>Add</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.helperText}>
            {editingCommonTriggers ? 'Add or remove common triggers.' : 'Tap Edit to manage common triggers.'}
          </Text>
        </View>

        {/* Common Symptoms */}
        <View style={styles.trackingSection}>
          <View style={styles.trackingHeader}>
            <MaterialCommunityIcons name="emoticon-sick-outline" size={20} color="#8B4789" />
            <Text style={styles.trackingTitle}>Common Symptoms</Text>
            <Pressable
              style={({ pressed }) => [styles.smallGhostButton, styles.sectionEditButton, pressed && styles.addButtonPressed]}
              onPress={() => setEditingCommonSymptoms((prev) => !prev)}
            >
              <Text style={styles.smallGhostButtonText}>{editingCommonSymptoms ? 'Done' : 'Edit'}</Text>
            </Pressable>
          </View>
          <View style={styles.tagsContainer}>
            {commonSymptoms.map((symptom) => (
              <View key={symptom.id} style={styles.tag}>
                <Text style={styles.tagText}>{symptom.name}</Text>
                {editingCommonSymptoms && (
                  <Pressable onPress={() => deleteCommonItem('symptom', symptom.id)}>
                    <MaterialCommunityIcons name="close" size={14} color="#8B4789" />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
          {editingCommonSymptoms && (
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Add common symptom"
                placeholderTextColor="#a0a0a0"
                value={newCommonSymptom}
                onChangeText={setNewCommonSymptom}
              />
              <Pressable
                style={({ pressed }) => [styles.inlineAddButton, pressed && styles.addButtonPressed]}
                onPress={() => addCommonItem('symptom')}
              >
                <Text style={styles.inlineAddButtonText}>Add</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.helperText}>
            {editingCommonSymptoms ? 'Add or remove common symptoms.' : 'Tap Edit to manage common symptoms.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getCalendarDays(cycleData, phaseOverrides, monthDate = new Date()) {
  const today = new Date();
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const calendarDays = [];

  for (let index = 0; index < monthStart.getDay(); index += 1) {
    calendarDays.push({ key: `empty-${index}`, empty: true });
  }

  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const summary = getCycleSummary(cycleData, date, phaseOverrides);
    calendarDays.push({
      key: toDateInputValue(date),
      empty: false,
      date,
      dateKey: toDateInputValue(date),
      dayNumber: day,
      phaseKey: summary?.phaseKey || null,
      isToday: toDateInputValue(date) === toDateInputValue(today),
      isPerimenstrualWindow: Boolean(summary?.isPerimenstrualWindow),
    });
  }

  return {
    monthLabel: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    days: calendarDays,
  };
}

function CycleTrackerScreen({ navigation, cycleData, setCycleData, cycleHistory, setCycleHistory, phaseOverrides, setPhaseOverrides }) {
  const [lastPeriodStartDate, setLastPeriodStartDate] = useState(cycleData?.lastPeriodStartDate || '');
  const [lastPeriodEndDate, setLastPeriodEndDate] = useState(cycleData?.lastPeriodEndDate || '');
  const [averageCycleLength, setAverageCycleLength] = useState(cycleData?.averageCycleLength || '28');
  const [ovulationDay, setOvulationDay] = useState(cycleData?.ovulationDay || '14');
  const [cycleNotes, setCycleNotes] = useState(cycleData?.notes || '');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(toDateInputValue(new Date()));
  const [displayMonth, setDisplayMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const cycleSummary = getCycleSummary(cycleData, new Date(), phaseOverrides);
  const calendarData = getCalendarDays(cycleData, phaseOverrides, displayMonth);
  const selectedDaySummary = getCycleSummary(cycleData, parseInputDate(selectedCalendarDate) || new Date(), phaseOverrides);

  const assignPhaseToDate = (phaseKey) => {
    setPhaseOverrides((prev) => ({ ...prev, [selectedCalendarDate]: phaseKey }));
    Alert.alert('Phase saved', `Dummy phase "${CYCLE_PHASE_META[phaseKey].name}" added for ${formatLongDate(selectedCalendarDate)}.`);
  };

  const shiftCalendarMonth = (offset) => {
    const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + offset, 1);
    setDisplayMonth(nextMonth);
    setSelectedCalendarDate(toDateInputValue(nextMonth));
  };

  const handleSaveCycle = () => {
    if (!lastPeriodStartDate.trim()) {
      Alert.alert('Last period start date needed', 'Please add the first day of your last period.');
      return;
    }

    const startDate = parseInputDate(lastPeriodStartDate.trim());
    if (!startDate) {
      Alert.alert('Invalid date', 'Please enter the date as YYYY-MM-DD.');
      return;
    }

    if (lastPeriodEndDate.trim() && !parseInputDate(lastPeriodEndDate.trim())) {
      Alert.alert('Invalid end date', 'Please enter the end date as YYYY-MM-DD or leave it blank.');
      return;
    }

    const parsedCycleLength = Number.parseInt(averageCycleLength, 10);
    if (!parsedCycleLength || parsedCycleLength < 21 || parsedCycleLength > 45) {
      Alert.alert('Cycle length looks off', 'Please enter an average cycle length between 21 and 45 days.');
      return;
    }

    const parsedOvulationDay = Number.parseInt(ovulationDay, 10);
    if (!parsedOvulationDay || parsedOvulationDay < 1 || parsedOvulationDay > parsedCycleLength) {
      Alert.alert('Ovulation day looks off', 'Please enter an ovulation day within your cycle length.');
      return;
    }

    const nextCycleData = {
      lastPeriodStartDate: lastPeriodStartDate.trim(),
      lastPeriodEndDate: lastPeriodEndDate.trim(),
      averageCycleLength: `${parsedCycleLength}`,
      ovulationDay: `${parsedOvulationDay}`,
      notes: cycleNotes.trim(),
    };
    const nextCycleSummary = getCycleSummary(nextCycleData);

    setCycleData(nextCycleData);
    setCycleHistory((prev) => {
      const nextEntry = {
        id: `cycle-${Date.now()}`,
        periodStart: nextCycleData.lastPeriodStartDate,
        periodEnd: nextCycleData.lastPeriodEndDate,
        cycleLength: parsedCycleLength,
        ovulationDay: parsedOvulationDay,
        perimenstrualStart: nextCycleSummary?.perimenstrualStartDate || '',
        perimenstrualEnd: nextCycleSummary?.perimenstrualEndDate || '',
        notes: nextCycleData.notes,
      };

      const dedupedEntries = prev.filter(
        (entry) =>
          !(
            entry.periodStart === nextEntry.periodStart &&
            entry.periodEnd === nextEntry.periodEnd &&
            entry.cycleLength === nextEntry.cycleLength
          )
      );

      return [nextEntry, ...dedupedEntries].slice(0, 8);
    });
    Alert.alert('Cycle tracker updated', 'Your cycle details were saved to this device.');
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderTopRow}>
            <View style={styles.detailHeaderSpacer} />
            <Pressable style={({ pressed }) => [styles.smallGhostButton, pressed && styles.addButtonPressed]} onPress={() => navigation.goBack()}>
              <Text style={styles.smallGhostButtonText}>Back</Text>
            </Pressable>
          </View>
          <Text style={styles.detailScreenTitle}>Cycle Tracker</Text>
          <Text style={styles.detailScreenSubtitle}>Track your menstrual cycle and phases</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailSectionTitle}>Your Cycle at a Glance</Text>
          <Text style={styles.detailSectionSubtitle}>A simple view of where you are in your cycle today.</Text>
          {cycleSummary ? (
            <View style={styles.glanceSummaryWrap}>
              <View style={[styles.glancePhaseSwatch, { backgroundColor: cycleSummary.phase.color }]} />
              <View style={styles.phaseSummaryCopy}>
                <Text style={styles.phaseSummaryTitle}>{cycleSummary.phase.name}</Text>
                <Text style={styles.phaseSummaryText}>Day {cycleSummary.dayInCycle} of {cycleSummary.cycleLength}</Text>
                {cycleSummary.isPerimenstrualWindow && (
                  <View style={styles.perimenstrualBadge}>
                    <Text style={styles.perimenstrualBadgeText}>Perimenstrual Window</Text>
                  </View>
                )}
                <Text style={styles.phaseSummaryText}>Estimated next period: {formatLongDate(cycleSummary.nextPeriodDate)}</Text>
                <Text style={styles.phaseSummaryText}>Perimenstrual window: {formatLongDate(cycleSummary.perimenstrualStartDate)} - {formatLongDate(cycleSummary.perimenstrualEndDate)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCycleState}>
              <Text style={styles.emptyCycleTitle}>No cycle data yet</Text>
              <Text style={styles.emptyCycleSubtitle}>Add your last period dates below and we’ll build your cycle view here.</Text>
            </View>
          )}
          <View style={styles.cycleTimelineWrap}>
            <View style={styles.cycleTimelineTrack}>
              {(cycleSummary?.segments || getCycleSegments(28, 14)).map((segment) => (
                <View
                  key={segment.key}
                  style={[
                    styles.cycleTimelineSegment,
                    { flex: segment.length, backgroundColor: segment.color },
                  ]}
                />
              ))}
              {cycleSummary && (
                <View
                  style={[
                    styles.cycleTodayMarker,
                    { left: `${((cycleSummary.dayInCycle - 0.5) / cycleSummary.cycleLength) * 100}%` },
                  ]}
                />
              )}
            </View>
            {cycleSummary && <Text style={styles.timelineCurrentDayLabel}>Today: Day {cycleSummary.dayInCycle}</Text>}
          </View>

          <View style={styles.cycleLegendGrid}>
            {getCycleSegments(cycleSummary?.cycleLength || 28).map((segment) => (
              <View key={segment.key} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: segment.color }]} />
                <Text style={styles.legendText}>{segment.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.perimenstrualExplanationBox}>
            <Text style={styles.perimenstrualExplanationTitle}>Perimenstrual window</Text>
            <Text style={styles.perimenstrualExplanationText}>
              We mark the 2 days before your period and the first 3 days of bleeding, since this can be a more sensitive time for migraine patterns.
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.detailSectionTitle}>Cycle Calendar</Text>
            <View style={styles.calendarMonthControls}>
              <Pressable style={({ pressed }) => [styles.calendarNavButton, pressed && styles.addButtonPressed]} onPress={() => shiftCalendarMonth(-1)}>
                <MaterialCommunityIcons name="chevron-left" size={18} color="#7f011f" />
              </Pressable>
              <Text style={styles.calendarMonthLabel}>{calendarData.monthLabel}</Text>
              <Pressable style={({ pressed }) => [styles.calendarNavButton, pressed && styles.addButtonPressed]} onPress={() => shiftCalendarMonth(1)}>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#7f011f" />
              </Pressable>
            </View>
          </View>
          <Text style={styles.detailSectionSubtitle}>Tap a date to assign a dummy phase and preview how your month may look.</Text>

          <View style={styles.calendarSurface}>
            <View style={styles.calendarWeekHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                <View key={label} style={[styles.calendarColumn, styles.calendarWeekdayCell]}>
                  <Text style={styles.calendarWeekdayText}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarData.days.map((item) => {
                if (item.empty) {
                  return (
                    <View key={item.key} style={[styles.calendarColumn, styles.calendarDayColumn]}>
                      <View style={styles.calendarEmptyCell} />
                    </View>
                  );
                }

                const isSelected = item.dateKey === selectedCalendarDate;
                return (
                  <View key={item.key} style={[styles.calendarColumn, styles.calendarDayColumn]}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.calendarDayCell,
                        isSelected && styles.calendarDaySelected,
                        item.isToday && styles.calendarToday,
                        pressed && styles.calendarDayPressed,
                      ]}
                      onPress={() => setSelectedCalendarDate(item.dateKey)}
                    >
                      <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{item.dayNumber}</Text>
                      <View style={styles.calendarIndicatorsRow}>
                        {item.phaseKey && <View style={[styles.calendarPhaseDot, { backgroundColor: CYCLE_PHASE_META[item.phaseKey].color }]} />}
                        {item.isPerimenstrualWindow && <View style={styles.calendarWindowMarker} />}
                      </View>
                      {item.phaseKey && (
                        <View style={[styles.calendarPhaseUnderline, { backgroundColor: CYCLE_PHASE_META[item.phaseKey].color }]} />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.selectedDatePanel}>
            <Text style={styles.selectedDateTitle}>Selected date: {formatLongDate(selectedCalendarDate)}</Text>
            <Text style={styles.selectedDateSubtitle}>
              {selectedDaySummary ? `${CYCLE_PHASE_META[selectedDaySummary.phaseKey].name} • Day ${selectedDaySummary.dayInCycle}` : 'No cycle estimate yet'}
            </Text>
            <View style={styles.phaseChipRow}>
              {Object.entries(CYCLE_PHASE_META).map(([phaseKey, meta]) => (
                <Pressable
                  key={phaseKey}
                  style={({ pressed }) => [
                    styles.phaseAssignChip,
                    phaseOverrides[selectedCalendarDate] === phaseKey && { backgroundColor: meta.color, borderColor: meta.color },
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => assignPhaseToDate(phaseKey)}
                >
                  <View style={[styles.phaseAssignChipDot, { backgroundColor: phaseOverrides[selectedCalendarDate] === phaseKey ? '#ffffff' : meta.color }]} />
                  <Text style={[styles.phaseAssignChipText, phaseOverrides[selectedCalendarDate] === phaseKey && styles.phaseAssignChipTextActive]}>
                    {meta.name.replace(' Phase', '')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailSectionTitle}>Cycle Input</Text>
          <Text style={styles.detailSectionSubtitle}>This mock form follows your cycle entry structure and keeps everything local for now.</Text>

          <View style={styles.cycleInputGrid}>
            <View style={styles.cycleInputColumn}>
              <Text style={styles.inlineFieldLabel}>Last Period Start Date</Text>
              <TextInput
                style={styles.addFormInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#a0a0a0"
                value={lastPeriodStartDate}
                onChangeText={setLastPeriodStartDate}
              />
            </View>

            <View style={styles.cycleInputColumn}>
              <Text style={styles.inlineFieldLabel}>Last Period End Date</Text>
              <TextInput
                style={styles.addFormInput}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor="#a0a0a0"
                value={lastPeriodEndDate}
                onChangeText={setLastPeriodEndDate}
              />
            </View>
          </View>

          <View style={styles.cycleInputGrid}>
            <View style={styles.cycleInputColumn}>
              <Text style={styles.inlineFieldLabel}>Average Cycle Length</Text>
              <TextInput
                style={styles.addFormInput}
                placeholder="28"
                placeholderTextColor="#a0a0a0"
                keyboardType="number-pad"
                value={averageCycleLength}
                onChangeText={setAverageCycleLength}
              />
            </View>

            <View style={styles.cycleInputColumn}>
              <Text style={styles.inlineFieldLabel}>Ovulation Day</Text>
              <TextInput
                style={styles.addFormInput}
                placeholder="14"
                placeholderTextColor="#a0a0a0"
                keyboardType="number-pad"
                value={ovulationDay}
                onChangeText={setOvulationDay}
              />
            </View>
          </View>

          <View style={styles.previewInfoRow}>
            <View style={styles.previewInfoChip}>
              <Text style={styles.previewInfoLabel}>Perimenstrual Start</Text>
              <Text style={styles.previewInfoValue}>{cycleSummary ? formatLongDate(cycleSummary.perimenstrualStartDate) : 'Not set'}</Text>
            </View>
            <View style={styles.previewInfoChip}>
              <Text style={styles.previewInfoLabel}>Perimenstrual End</Text>
              <Text style={styles.previewInfoValue}>{cycleSummary ? formatLongDate(cycleSummary.perimenstrualEndDate) : 'Not set'}</Text>
            </View>
          </View>

          <Text style={styles.inlineFieldLabel}>Notes</Text>
          <TextInput
            style={[styles.addFormInput, styles.addFormDetailsInput]}
            placeholder="Anything you want to remember about this cycle"
            placeholderTextColor="#a0a0a0"
            value={cycleNotes}
            onChangeText={setCycleNotes}
            multiline
            numberOfLines={3}
          />

          <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]} onPress={handleSaveCycle}>
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#ffffff" />
            <Text style={styles.submitButtonText}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailSectionTitle}>Cycle History</Text>
          <Text style={styles.detailSectionSubtitle}>Recent cycles saved on this device.</Text>
          {cycleHistory.map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View>
                <Text style={styles.historyTitle}>{formatLongDate(entry.periodStart)}</Text>
                <Text style={styles.historySubtitle}>
                  End: {entry.periodEnd ? formatLongDate(entry.periodEnd) : 'Not added'}
                </Text>
                <Text style={styles.historySubtitle}>
                  Ovulation: Day {entry.ovulationDay || '-'} • Window {entry.perimenstrualStart ? formatLongDate(entry.perimenstrualStart) : '-'} to {entry.perimenstrualEnd ? formatLongDate(entry.perimenstrualEnd) : '-'}
                </Text>
                {entry.notes ? <Text style={styles.historySubtitle}>Notes: {entry.notes}</Text> : null}
              </View>
              <Text style={styles.historyLength}>{entry.cycleLength} days</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecordsScreen() {
  const [activeView, setActiveView] = useState('calendar');
  const [displayMonth, setDisplayMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [logs, setLogs] = useState(() => createInitialMigraineLogs());
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const logsByDate = useMemo(() => logs.reduce((accumulator, log) => {
    const dateKey = toDateInputValue(new Date(log.dateTime));
    accumulator[dateKey] = (accumulator[dateKey] || 0) + 1;
    return accumulator;
  }, {}), [logs]);

  const calendarData = useMemo(() => buildRecordsCalendarWeeks(displayMonth, logsByDate), [displayMonth, logsByDate]);

  const monthLogs = useMemo(() => logs.filter((log) => {
    const logDate = new Date(log.dateTime);
    return logDate.getFullYear() === displayMonth.getFullYear() && logDate.getMonth() === displayMonth.getMonth();
  }), [logs, displayMonth]);

  const listLogs = useMemo(() => {
    let filtered = [...logs];

    if (selectedDateFilter) {
      filtered = filtered.filter((log) => toDateInputValue(new Date(log.dateTime)) === selectedDateFilter);
    }

    if (filterBy === 'with_aura') {
      filtered = filtered.filter((log) => log.auraPresent);
    } else if (filterBy === 'without_aura') {
      filtered = filtered.filter((log) => !log.auraPresent);
    } else if (filterBy === 'menstrual') {
      filtered = filtered.filter((log) => log.cyclePhaseKey === 'menstrual');
    }

    if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    } else if (sortBy === 'highest_intensity') {
      filtered.sort((a, b) => b.intensity - a.intensity || new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    }

    return filtered;
  }, [logs, selectedDateFilter, filterBy, sortBy]);

  const monthAverageIntensity = monthLogs.length
    ? (monthLogs.reduce((sum, log) => sum + log.intensity, 0) / monthLogs.length).toFixed(1)
    : '0.0';
  const monthAverageDuration = monthLogs.length
    ? (monthLogs.reduce((sum, log) => sum + log.durationHours, 0) / monthLogs.length).toFixed(1)
    : '0.0';

  const startRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const shiftMonth = (offset) => {
    const next = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + offset, 1);
    setDisplayMonth(next);
  };

  const handleSelectCalendarDate = (dateKey) => {
    setSelectedDateFilter(dateKey);
    setActiveView('list');
  };

  const openEditModal = (log) => {
    setEditingLogId(log.id);
    setEditForm({
      intensity: `${log.intensity}`,
      durationHours: `${log.durationHours}`,
      symptoms: log.symptoms.join(', '),
      cyclePhaseKey: log.cyclePhaseKey,
      cycleDay: `${log.cycleDay}`,
      auraPresent: Boolean(log.auraPresent),
      auraDescription: log.auraDescription || '',
      triggers: log.triggers.join(', '),
      medications: log.medications.join(', '),
      notes: log.notes || '',
    });
  };

  const closeEditModal = () => {
    setEditingLogId(null);
    setEditForm(null);
  };

  const saveEditedLog = () => {
    if (!editingLogId || !editForm) {
      return;
    }

    const parsedIntensity = Number.parseInt(editForm.intensity, 10);
    const parsedDuration = Number.parseFloat(editForm.durationHours);
    const parsedCycleDay = Number.parseInt(editForm.cycleDay, 10);

    if (!parsedIntensity || parsedIntensity < 1 || parsedIntensity > 10) {
      Alert.alert('Invalid intensity', 'Please enter an intensity between 1 and 10.');
      return;
    }
    if (!parsedDuration || parsedDuration <= 0) {
      Alert.alert('Invalid duration', 'Please enter a valid duration in hours.');
      return;
    }
    if (!parsedCycleDay || parsedCycleDay < 1) {
      Alert.alert('Invalid cycle day', 'Please enter a valid cycle day.');
      return;
    }

    const parseList = (value) =>
      value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    setLogs((prev) => prev.map((log) => {
      if (log.id !== editingLogId) {
        return log;
      }
      return {
        ...log,
        intensity: parsedIntensity,
        durationHours: parsedDuration,
        symptoms: parseList(editForm.symptoms),
        cyclePhaseKey: editForm.cyclePhaseKey,
        cycleDay: parsedCycleDay,
        auraPresent: editForm.auraPresent,
        auraDescription: editForm.auraDescription?.trim() || '',
        triggers: parseList(editForm.triggers),
        medications: parseList(editForm.medications),
        notes: editForm.notes.trim(),
      };
    }));

    closeEditModal();
    Alert.alert('Saved', 'Log updated successfully (dummy).');
  };

  const confirmDeleteLog = (logId) => {
    Alert.alert(
      'Delete log',
      'Are you sure you want to delete this log? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLogs((prev) => prev.filter((log) => log.id !== logId));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView
        contentContainerStyle={styles.recordsScreenContent}
        showsVerticalScrollIndicator={false}
        refreshControl={activeView === 'list' ? <RefreshControl refreshing={isRefreshing} onRefresh={startRefresh} /> : undefined}
      >
        <View style={styles.recordsHeader}>
          <Text style={styles.recordsTitle}>Records</Text>
          <Text style={styles.recordsSubtitle}>View and manage your migraine history</Text>
          <View style={styles.recordsViewToggleRow}>
            <Pressable
              style={({ pressed }) => [
                styles.recordsViewToggle,
                activeView === 'calendar' && styles.recordsViewToggleActive,
                pressed && styles.addButtonPressed,
              ]}
              onPress={() => setActiveView('calendar')}
            >
              <Text style={[styles.recordsViewToggleText, activeView === 'calendar' && styles.recordsViewToggleTextActive]}>Calendar View</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.recordsViewToggle,
                activeView === 'list' && styles.recordsViewToggleActive,
                pressed && styles.addButtonPressed,
              ]}
              onPress={() => setActiveView('list')}
            >
              <Text style={[styles.recordsViewToggleText, activeView === 'list' && styles.recordsViewToggleTextActive]}>List View</Text>
            </Pressable>
          </View>
        </View>

        {activeView === 'calendar' ? (
          <>
            <View style={styles.recordsCalendarStatsCard}>
              <View style={styles.recordsCalendarStatsRow}>
                <View style={styles.recordsCalendarStatItem}>
                  <MaterialCommunityIcons name="chart-box-outline" size={20} color="#7f011f" />
                  <View>
                    <Text style={styles.recordsCalendarStatValue}>{monthLogs.length}</Text>
                    <Text style={styles.recordsCalendarStatLabel}>Logs</Text>
                  </View>
                </View>
                <View style={styles.recordsCalendarStatDivider} />
                <View style={styles.recordsCalendarStatItem}>
                  <MaterialCommunityIcons name="speedometer" size={20} color="#7f011f" />
                  <View>
                    <Text style={styles.recordsCalendarStatValue}>{monthAverageIntensity}/10</Text>
                    <Text style={styles.recordsCalendarStatLabel}>Avg Intensity</Text>
                  </View>
                </View>
                <View style={styles.recordsCalendarStatDivider} />
                <View style={styles.recordsCalendarStatItem}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#7f011f" />
                  <View>
                    <Text style={styles.recordsCalendarStatValue}>{monthAverageDuration}h</Text>
                    <Text style={styles.recordsCalendarStatLabel}>Avg Duration</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.recordsCalendarCard}>
              <View style={styles.recordsCalendarNavRow}>
                <Pressable style={({ pressed }) => [styles.recordsCalendarNavButton, pressed && styles.addButtonPressed]} onPress={() => shiftMonth(-1)}>
                  <MaterialCommunityIcons name="chevron-left" size={18} color="#7f011f" />
                </Pressable>
                <Text style={styles.recordsCalendarMonthLabel}>{calendarData.monthLabel}</Text>
                <Pressable style={({ pressed }) => [styles.recordsCalendarNavButton, pressed && styles.addButtonPressed]} onPress={() => shiftMonth(1)}>
                  <MaterialCommunityIcons name="chevron-right" size={18} color="#7f011f" />
                </Pressable>
              </View>

              <View style={styles.recordsCalendarWeekHeader}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                  <View key={label} style={styles.recordsCalendarColumn}>
                    <Text style={styles.recordsCalendarWeekLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              {calendarData.weeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.recordsCalendarWeekRow}>
                  {week.map((cell) => (
                    <View key={cell.key} style={styles.recordsCalendarColumn}>
                      {cell.empty ? (
                        <View style={styles.recordsCalendarEmptyCell} />
                      ) : (
                        <Pressable
                          style={({ pressed }) => [
                            styles.recordsCalendarDayCell,
                            cell.isToday && styles.recordsCalendarDayCellToday,
                            selectedDateFilter === cell.dateKey && styles.recordsCalendarDayCellSelected,
                            pressed && styles.recordsCalendarDayCellPressed,
                          ]}
                          onPress={() => handleSelectCalendarDate(cell.dateKey)}
                        >
                          <Text style={[styles.recordsCalendarDayText, cell.isToday && styles.recordsCalendarDayTextToday]}>{cell.dayNumber}</Text>
                          {cell.hasLogs ? <View style={styles.recordsCalendarDot} /> : null}
                        </Pressable>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View style={styles.recordsCalendarLegendCard}>
              <Text style={styles.recordsCalendarLegendTitle}>Legend</Text>
              <View style={styles.recordsCalendarLegendRow}>
                <View style={styles.recordsCalendarLegendItem}>
                  <View style={[styles.recordsCalendarLegendSwatch, { borderColor: '#7f011f', borderWidth: 2 }]} />
                  <Text style={styles.recordsCalendarLegendText}>Today</Text>
                </View>
                <View style={styles.recordsCalendarLegendItem}>
                  <View style={styles.recordsCalendarLegendSwatch}>
                    <View style={styles.recordsCalendarDot} />
                  </View>
                  <Text style={styles.recordsCalendarLegendText}>Migraine logged</Text>
                </View>
              </View>
              <Text style={styles.recordsCalendarLegendHint}>Tap any day to view or filter logs for that date</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.recordsStatsBar}>
              <View style={styles.recordsStatsHeader}>
                <MaterialCommunityIcons name="chart-line" size={22} color="#7f011f" />
                <Text style={styles.recordsStatsTitle}>This Month's Overview</Text>
              </View>
              <View style={styles.recordsStatsGrid}>
                <View style={styles.recordsStatBox}>
                  <Text style={styles.recordsStatValue}>{monthLogs.length}</Text>
                  <Text style={styles.recordsStatLabel}>Total Logs</Text>
                </View>
                <View style={styles.recordsStatBox}>
                  <Text style={styles.recordsStatValue}>{monthAverageIntensity}/10</Text>
                  <Text style={styles.recordsStatLabel}>Avg Intensity</Text>
                </View>
                <View style={styles.recordsStatBox}>
                  <Text style={styles.recordsStatValue}>{monthAverageDuration}h</Text>
                  <Text style={styles.recordsStatLabel}>Avg Duration</Text>
                </View>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recordsFilterRow}>
              {[
                { key: 'all', label: 'All' },
                { key: 'with_aura', label: 'With Aura' },
                { key: 'without_aura', label: 'Without Aura' },
                { key: 'menstrual', label: 'Menstrual-related' },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.recordsFilterChip,
                    filterBy === option.key && styles.recordsFilterChipActive,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => setFilterBy(option.key)}
                >
                  <Text style={[styles.recordsFilterChipText, filterBy === option.key && styles.recordsFilterChipTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recordsFilterRow}>
              {[
                { key: 'newest', label: 'Newest first' },
                { key: 'oldest', label: 'Oldest first' },
                { key: 'highest_intensity', label: 'Highest intensity' },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.recordsFilterChip,
                    sortBy === option.key && styles.recordsFilterChipActive,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text style={[styles.recordsFilterChipText, sortBy === option.key && styles.recordsFilterChipTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {selectedDateFilter ? (
              <View style={styles.recordsSelectedFilterBar}>
                <Text style={styles.recordsSelectedFilterText}>Showing logs for {formatLongDate(selectedDateFilter)}</Text>
                <Pressable onPress={() => setSelectedDateFilter(null)}>
                  <Text style={styles.recordsSelectedFilterClear}>Clear</Text>
                </Pressable>
              </View>
            ) : null}

            {listLogs.length ? (
              <View style={styles.recordsListWrap}>
                {listLogs.map((log) => {
                  const phaseMeta = CYCLE_PHASE_META[log.cyclePhaseKey] || CYCLE_PHASE_META.luteal;
                  return (
                    <View key={log.id} style={styles.recordLogCard}>
                      <View style={styles.recordLogHeaderRow}>
                        <Text style={styles.recordLogDateTime}>{formatDateTimeLabel(log.dateTime)}</Text>
                        <View style={styles.recordLogActionsRow}>
                          <Pressable style={({ pressed }) => [styles.recordActionButton, pressed && styles.addButtonPressed]} onPress={() => openEditModal(log)}>
                            <MaterialCommunityIcons name="pencil-outline" size={16} color="#7f011f" />
                          </Pressable>
                          <Pressable style={({ pressed }) => [styles.recordActionButton, pressed && styles.addButtonPressed]} onPress={() => confirmDeleteLog(log.id)}>
                            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#b91c3a" />
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.recordSeverityRow}>
                        <Text style={styles.recordSeverityLabel}>Intensity</Text>
                        <View style={styles.recordSeverityTrack}>
                          <View style={[styles.recordSeverityFill, { width: `${(log.intensity / 10) * 100}%` }]} />
                        </View>
                        <Text style={styles.recordSeverityValue}>{log.intensity}/10</Text>
                      </View>

                      <Text style={styles.recordDetailText}>Duration: {log.durationHours} hours</Text>
                      <Text style={styles.recordDetailText}>Symptoms: {log.symptoms.join(', ') || 'None'}</Text>
                      <Text style={styles.recordDetailText}>Cycle phase: {phaseMeta.name} · Day {log.cycleDay}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.recordsListEmpty}>
                <Text style={styles.emptyTitle}>No logs yet</Text>
                <Text style={styles.emptySubtitle}>Log your first migraine from the Log Attack tab.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={Boolean(editingLogId && editForm)} transparent animationType="slide" onRequestClose={closeEditModal}>
        <View style={styles.recordsModalBackdrop}>
          <View style={styles.recordsModalCard}>
            <Text style={styles.recordsModalTitle}>Edit Migraine Log</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.recordsModalContent}>
              <Text style={styles.recordsModalLabel}>Intensity (1-10)</Text>
              <TextInput
                style={styles.addFormInput}
                keyboardType="number-pad"
                value={editForm?.intensity || ''}
                onChangeText={(value) => setEditForm((prev) => ({ ...prev, intensity: value }))}
              />

              <Text style={styles.recordsModalLabel}>Duration (hours)</Text>
              <TextInput
                style={styles.addFormInput}
                keyboardType="decimal-pad"
                value={editForm?.durationHours || ''}
                onChangeText={(value) => setEditForm((prev) => ({ ...prev, durationHours: value }))}
              />

              <Text style={styles.recordsModalLabel}>Symptoms (comma separated)</Text>
              <TextInput
                style={styles.addFormInput}
                value={editForm?.symptoms || ''}
                onChangeText={(value) => setEditForm((prev) => ({ ...prev, symptoms: value }))}
              />

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Aura present</Text>
                <View style={styles.binaryButtonsRow}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.binaryButton,
                      editForm?.auraPresent && styles.binaryButtonActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => setEditForm((prev) => ({ ...prev, auraPresent: true }))}
                  >
                    <Text style={[styles.binaryButtonText, editForm?.auraPresent && styles.toggleButtonTextActive]}>Yes</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.binaryButton,
                      !editForm?.auraPresent && styles.binaryButtonActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => setEditForm((prev) => ({ ...prev, auraPresent: false }))}
                  >
                    <Text style={[styles.binaryButtonText, !editForm?.auraPresent && styles.toggleButtonTextActive]}>No</Text>
                  </Pressable>
                </View>
              </View>

              {editForm?.auraPresent ? (
                <>
                  <Text style={styles.recordsModalLabel}>Aura description</Text>
                  <TextInput
                    style={[styles.addFormInput, styles.addFormDetailsInput]}
                    placeholder="Describe your aura experience"
                    placeholderTextColor="#a0a0a0"
                    multiline
                    numberOfLines={2}
                    value={editForm?.auraDescription || ''}
                    onChangeText={(value) => setEditForm((prev) => ({ ...prev, auraDescription: value }))}
                  />
                </>
              ) : null}

              <Text style={styles.recordsModalLabel}>Cycle phase</Text>
              <View style={styles.recordsPhaseRow}>
                {Object.entries(CYCLE_PHASE_META).map(([key, meta]) => (
                  <Pressable
                    key={key}
                    style={({ pressed }) => [
                      styles.recordsPhaseChip,
                      editForm?.cyclePhaseKey === key && styles.recordsPhaseChipActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => setEditForm((prev) => ({ ...prev, cyclePhaseKey: key }))}
                  >
                    <Text style={[styles.recordsPhaseChipText, editForm?.cyclePhaseKey === key && styles.recordsPhaseChipTextActive]}>{meta.name}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.recordsModalLabel}>Cycle day</Text>
              <TextInput
                style={styles.addFormInput}
                keyboardType="number-pad"
                value={editForm?.cycleDay || ''}
                onChangeText={(value) => setEditForm((prev) => ({ ...prev, cycleDay: value }))}
              />

              <Text style={styles.recordsModalLabel}>Triggers (comma separated)</Text>
              <TextInput
                style={styles.addFormInput}
                value={editForm?.triggers || ''}
                onChangeText={(value) => setEditForm((prev) => ({ ...prev, triggers: value }))}
              />

              <Text style={styles.recordsModalLabel}>Medications (comma separated)</Text>
              <TextInput
                style={styles.addFormInput}
                value={editForm?.medications || ''}
                onChangeText={(value) => setEditForm((prev) => ({ ...prev, medications: value }))}
              />

              <Text style={styles.recordsModalLabel}>Notes</Text>
              <TextInput
                style={[styles.addFormInput, styles.addFormDetailsInput]}
                multiline
                numberOfLines={3}
                value={editForm?.notes || ''}
                onChangeText={(value) => setEditForm((prev) => ({ ...prev, notes: value }))}
              />
            </ScrollView>

            <View style={styles.recordsModalActions}>
              <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]} onPress={closeEditModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.submitButton, styles.submitButtonHalf, pressed && styles.submitButtonPressed]} onPress={saveEditedLog}>
                <Text style={styles.submitButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function LogAttackScreen({ navigation }) {
  const defaultSymptoms = [
    { id: 'sym-nausea', name: 'Nausea', isCustom: false },
    { id: 'sym-photophobia', name: 'Photophobia', isCustom: false },
    { id: 'sym-phonophobia', name: 'Phonophobia', isCustom: false },
    { id: 'sym-aura', name: 'Aura', isCustom: false },
    { id: 'sym-dizziness', name: 'Dizziness', isCustom: false },
    { id: 'sym-fatigue', name: 'Fatigue', isCustom: false },
  ];
  const defaultTriggers = [
    { id: 'trig-stress', name: 'Stress', category: 'stress', isCustom: false },
    { id: 'trig-sleep', name: 'Sleep', category: 'sleep', isCustom: false },
    { id: 'trig-weather', name: 'Weather', category: 'weather', isCustom: false },
    { id: 'trig-food', name: 'Food', category: 'food', isCustom: false },
    { id: 'trig-exercise', name: 'Exercise', category: 'other', isCustom: false },
  ];
  const defaultMedications = [
    { id: 'med-ibuprofen', name: 'Ibuprofen', isCustom: false },
    { id: 'med-naproxen', name: 'Naproxen', isCustom: false },
    { id: 'med-sumatriptan', name: 'Sumatriptan', isCustom: false },
  ];

  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [auraPresent, setAuraPresent] = useState(false);
  const [auraDescription, setAuraDescription] = useState('');
  const [cyclePhase, setCyclePhase] = useState('luteal');
  const [weatherTemp, setWeatherTemp] = useState('');
  const [weatherPressure, setWeatherPressure] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [availableSymptoms, setAvailableSymptoms] = useState(defaultSymptoms);
  const [availableTriggers, setAvailableTriggers] = useState(defaultTriggers);
  const [availableMedications, setAvailableMedications] = useState(defaultMedications);
  const [selectedSymptomIds, setSelectedSymptomIds] = useState([]);
  const [selectedTriggerIds, setSelectedTriggerIds] = useState([]);
  const [selectedMedicationIds, setSelectedMedicationIds] = useState([]);
  const [customSymptomName, setCustomSymptomName] = useState('');
  const [customTriggerName, setCustomTriggerName] = useState('');
  const [customMedicationName, setCustomMedicationName] = useState('');

  const toggleSelection = (type, id) => {
    if (type === 'symptom') {
      setSelectedSymptomIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
      return;
    }
    if (type === 'medication') {
      setSelectedMedicationIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
      return;
    }
    setSelectedTriggerIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptomName.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Enter a custom symptom name.');
      return;
    }
    const exists = availableSymptoms.some((symptom) => symptom.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Alert.alert('Already exists', 'This symptom already exists.');
      return;
    }
    const id = `sym-custom-${Date.now()}`;
    const newSymptom = { id, name: trimmed, isCustom: true };
    setAvailableSymptoms((prev) => [...prev, newSymptom]);
    setSelectedSymptomIds((prev) => [...prev, id]);
    setCustomSymptomName('');
  };

  const addCustomTrigger = () => {
    const trimmed = customTriggerName.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Enter a custom trigger name.');
      return;
    }
    const exists = availableTriggers.some((trigger) => trigger.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Alert.alert('Already exists', 'This trigger already exists.');
      return;
    }
    const id = `trig-custom-${Date.now()}`;
    const newTrigger = { id, name: trimmed, category: 'other', isCustom: true };
    setAvailableTriggers((prev) => [...prev, newTrigger]);
    setSelectedTriggerIds((prev) => [...prev, id]);
    setCustomTriggerName('');
  };

  const addCustomMedication = () => {
    const trimmed = customMedicationName.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Enter a medication name.');
      return;
    }
    const exists = availableMedications.some((medication) => medication.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Alert.alert('Already exists', 'This medication already exists.');
      return;
    }
    const id = `med-custom-${Date.now()}`;
    const newMedication = { id, name: trimmed, isCustom: true };
    setAvailableMedications((prev) => [...prev, newMedication]);
    setSelectedMedicationIds((prev) => [...prev, id]);
    setCustomMedicationName('');
  };

  const selectedSymptoms = availableSymptoms.filter((symptom) => selectedSymptomIds.includes(symptom.id));
  const selectedTriggers = availableTriggers.filter((trigger) => selectedTriggerIds.includes(trigger.id));
  const selectedMedications = availableMedications.filter((medication) => selectedMedicationIds.includes(medication.id));
  const severityAlertSent = intensity >= 8;
  const recommendationGiven = intensity >= 8
    ? 'High severity detected. Rest in a dark room, hydrate, and consider your rescue medication.'
    : 'Keep tracking patterns and maintain hydration/rest.';

  const handleReview = () => {
    if (!startTime.trim()) {
      Alert.alert('Required', 'Please enter start time.');
      return;
    }
    setShowReview(true);
  };

  const resetLogAttackForm = () => {
    setIntensity(5);
    setNotes('');
    setStartTime('');
    setEndTime('');
    setAuraPresent(false);
    setAuraDescription('');
    setCyclePhase('luteal');
    setWeatherTemp('');
    setWeatherPressure('');
    setShowReview(false);
    setAvailableSymptoms(defaultSymptoms);
    setAvailableTriggers(defaultTriggers);
    setAvailableMedications(defaultMedications);
    setSelectedSymptomIds([]);
    setSelectedTriggerIds([]);
    setSelectedMedicationIds([]);
    setCustomSymptomName('');
    setCustomTriggerName('');
    setCustomMedicationName('');
  };

  const handleConfirmLog = () => {
    resetLogAttackForm();
    Alert.alert(
      'Attack Logged',
      `Saved successfully (dummy).\n${recommendationGiven}`
    );
    navigation.getParent()?.navigate('HomeTab');
  };

  const goBackHome = () => {
    resetLogAttackForm();
    navigation.getParent()?.navigate('HomeTab');
  };

  if (showReview) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logHeader}>
            <View style={styles.logHeaderLeft}>
              <View style={styles.sectionIconWrapper}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#7f011f" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Review Summary</Text>
                <Text style={styles.sectionSubtitle}>Confirm before saving</Text>
              </View>
            </View>
            <Pressable style={({ pressed }) => [styles.headerCancelButton, pressed && styles.addButtonPressed]} onPress={goBackHome}>
              <Text style={styles.headerCancelText}>Cancel</Text>
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Logged At:</Text> {new Date().toLocaleString()}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Start:</Text> {startTime}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>End:</Text> {endTime || 'Not set'}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Intensity:</Text> {intensity}/10</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Aura:</Text> {auraPresent ? `Yes${auraDescription ? ` (${auraDescription})` : ''}` : 'No'}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Symptoms:</Text> {selectedSymptoms.map((item) => item.name).join(', ') || 'None'}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Triggers:</Text> {selectedTriggers.map((item) => item.name).join(', ') || 'None'}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Medications:</Text> {selectedMedications.map((item) => item.name).join(', ') || 'None'}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Cycle Phase:</Text> {cyclePhase}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Weather:</Text> {weatherTemp || 'N/A'}°C • {weatherPressure || 'N/A'} hPa</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Severity alert:</Text> {severityAlertSent ? 'Yes' : 'No'}</Text>
              <Text style={styles.summaryRow}><Text style={styles.summaryLabel}>Notes:</Text> {notes || 'None'}</Text>
            </View>

            <View style={styles.summaryActions}>
              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                onPress={() => setShowReview(false)}
              >
                <Text style={styles.cancelButtonText}>Edit</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.submitButton, styles.submitButtonHalf, pressed && styles.submitButtonPressed]}
                onPress={handleConfirmLog}
              >
                <MaterialCommunityIcons name="check" size={18} color="#ffffff" />
                <Text style={styles.submitButtonText}>Confirm Log</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <View style={styles.sectionIconWrapper}>
              <MaterialCommunityIcons name="flash" size={22} color="#7f011f" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Log Attack</Text>
              <Text style={styles.sectionSubtitle}>Record your migraine</Text>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.headerCancelButton, pressed && styles.addButtonPressed]} onPress={goBackHome}>
            <Text style={styles.headerCancelText}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <FormGroup label="Pain Intensity" required>
            <View style={styles.sliderContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Pressable
                  key={num}
                  style={[styles.intensityButton, intensity === num && styles.intensityButtonActive]}
                  onPress={() => setIntensity(num)}
                >
                  <Text style={[styles.intensityText, intensity === num && styles.intensityTextActive]}>
                    {num}
                  </Text>
                </Pressable>
              ))}
            </View>
          </FormGroup>

          <FormGroup label="Start Time" required>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD HH:MM"
              value={startTime}
              onChangeText={setStartTime}
            />
          </FormGroup>

          <FormGroup label="End Time">
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD HH:MM"
              value={endTime}
              onChangeText={setEndTime}
            />
          </FormGroup>

          <FormGroup label="Aura Present">
            <View style={styles.binaryButtonsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.binaryButton,
                  auraPresent && styles.binaryButtonActive,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => setAuraPresent(true)}
              >
                <Text style={[styles.binaryButtonText, auraPresent && styles.binaryButtonTextActive]}>Yes</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.binaryButton,
                  !auraPresent && styles.binaryButtonActive,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => setAuraPresent(false)}
              >
                <Text style={[styles.binaryButtonText, !auraPresent && styles.binaryButtonTextActive]}>No</Text>
              </Pressable>
            </View>
          </FormGroup>

          {auraPresent && (
            <FormGroup label="Aura Description">
              <TextInput
                style={styles.textInput}
                placeholder="Describe aura present"
                value={auraDescription}
                onChangeText={setAuraDescription}
              />
            </FormGroup>
          )}

          <FormGroup label="Symptoms">
            <View style={styles.optionChipsContainer}>
              {availableSymptoms.map((symptom) => {
                const selected = selectedSymptomIds.includes(symptom.id);
                return (
                  <Pressable
                    key={symptom.id}
                    style={({ pressed }) => [
                      styles.optionChip,
                      selected && styles.optionChipActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => toggleSelection('symptom', symptom.id)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>
                      {symptom.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Add custom symptom"
                placeholderTextColor="#a0a0a0"
                value={customSymptomName}
                onChangeText={setCustomSymptomName}
              />
              <Pressable
                style={({ pressed }) => [styles.inlineAddButton, pressed && styles.addButtonPressed]}
                onPress={addCustomSymptom}
              >
                <Text style={styles.inlineAddButtonText}>Add</Text>
              </Pressable>
            </View>
          </FormGroup>

          <FormGroup label="Triggers">
            <View style={styles.optionChipsContainer}>
              {availableTriggers.map((trigger) => {
                const selected = selectedTriggerIds.includes(trigger.id);
                return (
                  <Pressable
                    key={trigger.id}
                    style={({ pressed }) => [
                      styles.optionChip,
                      selected && styles.optionChipActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => toggleSelection('trigger', trigger.id)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>
                      {trigger.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Add custom trigger"
                placeholderTextColor="#a0a0a0"
                value={customTriggerName}
                onChangeText={setCustomTriggerName}
              />
              <Pressable
                style={({ pressed }) => [styles.inlineAddButton, pressed && styles.addButtonPressed]}
                onPress={addCustomTrigger}
              >
                <Text style={styles.inlineAddButtonText}>Add</Text>
              </Pressable>
            </View>
          </FormGroup>

          <FormGroup label="Medications Taken">
            <View style={styles.optionChipsContainer}>
              {availableMedications.map((medication) => {
                const selected = selectedMedicationIds.includes(medication.id);
                return (
                  <Pressable
                    key={medication.id}
                    style={({ pressed }) => [
                      styles.optionChip,
                      selected && styles.optionChipActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => toggleSelection('medication', medication.id)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>
                      {medication.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Add custom medication"
                placeholderTextColor="#a0a0a0"
                value={customMedicationName}
                onChangeText={setCustomMedicationName}
              />
              <Pressable
                style={({ pressed }) => [styles.inlineAddButton, pressed && styles.addButtonPressed]}
                onPress={addCustomMedication}
              >
                <Text style={styles.inlineAddButtonText}>Add</Text>
              </Pressable>
            </View>
          </FormGroup>

          <FormGroup label="Cycle Phase">
            <View style={styles.optionChipsContainer}>
              {['menstrual', 'follicular', 'ovulatory', 'luteal'].map((phase) => {
                const selected = cyclePhase === phase;
                return (
                  <Pressable
                    key={phase}
                    style={({ pressed }) => [
                      styles.optionChip,
                      selected && styles.optionChipActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => setCyclePhase(phase)}
                  >
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>
                      {phase}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </FormGroup>

          <FormGroup label="Weather (optional)">
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Temp °C"
                placeholderTextColor="#a0a0a0"
                keyboardType="decimal-pad"
                value={weatherTemp}
                onChangeText={setWeatherTemp}
              />
              <TextInput
                style={styles.inlineInput}
                placeholder="Pressure hPa"
                placeholderTextColor="#a0a0a0"
                keyboardType="decimal-pad"
                value={weatherPressure}
                onChangeText={setWeatherPressure}
              />
            </View>
          </FormGroup>

          <FormGroup label="Notes">
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add any additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </FormGroup>

          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
            onPress={handleReview}
          >
            <MaterialCommunityIcons name="file-document-edit-outline" size={18} color="#ffffff" />
            <Text style={styles.submitButtonText}>Review Summary</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Insights Screen

function InsightsScreen({ navigation }) {
  const [selectedRange, setSelectedRange] = useState('3m');
  const [activityMonthOffset, setActivityMonthOffset] = useState(0);
  const rangeOptions = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: '3m', label: '3 Months' },
    { key: 'year', label: 'Year' },
  ];
  const insightsByRange = {
    day: {
      dateRangeLabel: 'Today',
      summaryStats: [
        { label: 'Total Migraines', value: '1' },
        { label: 'Average Intensity', value: '6.0/10' },
        { label: 'Avg Duration', value: '3.0 hrs' },
        { label: 'Triggered by Cycle', value: '100%' },
      ],
      phaseDistribution: [
        { key: 'menstrual', label: 'Menstrual', value: 1, color: '#d94764' },
        { key: 'follicular', label: 'Follicular', value: 0, color: '#5aa469' },
        { key: 'ovulatory', label: 'Ovulatory', value: 0, color: '#f4a261' },
        { key: 'luteal', label: 'Luteal', value: 0, color: '#8b5fbf' },
      ],
      triggerData: [
        { label: 'Stress', value: 1, color: '#7f011f' },
        { label: 'Sleep Deprivation', value: 0, color: '#c0465f' },
        { label: 'Weather Change', value: 0, color: '#f4a261' },
        { label: 'Hormonal', value: 1, color: '#8b5fbf' },
      ],
      medicationData: [
        { name: 'Sumatriptan', stars: 4, insight: 'Worked well today' },
        { name: 'Propranolol', stars: 3, insight: 'Baseline preventive support' },
      ],
      trendData: [
        { month: 'Mon', count: 0 },
        { month: 'Tue', count: 1 },
        { month: 'Wed', count: 0 },
        { month: 'Thu', count: 1 },
        { month: 'Fri', count: 0 },
        { month: 'Sat', count: 0 },
        { month: 'Sun', count: 1 },
      ],
      activityCalendar: [
        [0, 0, 1, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
    },
    week: {
      dateRangeLabel: 'Last 7 days',
      summaryStats: [
        { label: 'Total Migraines', value: '4' },
        { label: 'Average Intensity', value: '6.8/10' },
        { label: 'Avg Duration', value: '3.8 hrs' },
        { label: 'Triggered by Cycle', value: '50%' },
      ],
      phaseDistribution: [
        { key: 'menstrual', label: 'Menstrual', value: 1, color: '#d94764' },
        { key: 'follicular', label: 'Follicular', value: 1, color: '#5aa469' },
        { key: 'ovulatory', label: 'Ovulatory', value: 0, color: '#f4a261' },
        { key: 'luteal', label: 'Luteal', value: 2, color: '#8b5fbf' },
      ],
      triggerData: [
        { label: 'Stress', value: 4, color: '#7f011f' },
        { label: 'Sleep Deprivation', value: 2, color: '#c0465f' },
        { label: 'Weather Change', value: 1, color: '#f4a261' },
        { label: 'Hormonal', value: 2, color: '#8b5fbf' },
      ],
      medicationData: [
        { name: 'Sumatriptan', stars: 4, insight: 'Effective in 3 of 4 attacks' },
        { name: 'Propranolol', stars: 3, insight: 'Moderately effective this week' },
      ],
      trendData: [
        { month: 'Week -3', count: 5 },
        { month: 'Week -2', count: 4 },
        { month: 'Week -1', count: 3 },
        { month: 'This week', count: 4 },
      ],
      activityCalendar: [
        [0, 1, 1, 0, 0, 0, 1],
        [0, 0, 1, 0, 2, 0, 1],
        [0, 1, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0],
      ],
    },
    month: {
      dateRangeLabel: 'Last 30 days',
      summaryStats: [
        { label: 'Total Migraines', value: '7' },
        { label: 'Average Intensity', value: '7.0/10' },
        { label: 'Avg Duration', value: '4.1 hrs' },
        { label: 'Triggered by Cycle', value: '57%' },
      ],
      phaseDistribution: [
        { key: 'menstrual', label: 'Menstrual', value: 3, color: '#d94764' },
        { key: 'follicular', label: 'Follicular', value: 1, color: '#5aa469' },
        { key: 'ovulatory', label: 'Ovulatory', value: 1, color: '#f4a261' },
        { key: 'luteal', label: 'Luteal', value: 5, color: '#8b5fbf' },
      ],
      triggerData: [
        { label: 'Stress', value: 7, color: '#7f011f' },
        { label: 'Sleep Deprivation', value: 5, color: '#c0465f' },
        { label: 'Weather Change', value: 4, color: '#f4a261' },
        { label: 'Hormonal', value: 6, color: '#8b5fbf' },
      ],
      medicationData: [
        { name: 'Sumatriptan', stars: 4, insight: 'Effective 78% of the time' },
        { name: 'Propranolol', stars: 3, insight: 'Moderately effective overall' },
      ],
      trendData: [
        { month: 'Week 1', count: 3 },
        { month: 'Week 2', count: 2 },
        { month: 'Week 3', count: 1 },
        { month: 'Week 4', count: 1 },
      ],
      activityCalendar: [
        [1, 0, 1, 0, 2, 0, 0],
        [0, 1, 0, 2, 1, 0, 1],
        [2, 1, 0, 0, 1, 2, 0],
        [1, 0, 1, 0, 2, 1, 0],
        [0, 1, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0],
      ],
    },
    '3m': {
      dateRangeLabel: 'Last 3 months',
      summaryStats: [
        { label: 'Total Migraines', value: '12' },
        { label: 'Average Intensity', value: '7.2/10' },
        { label: 'Avg Duration', value: '4.5 hrs' },
        { label: 'Triggered by Cycle', value: '67%' },
      ],
      phaseDistribution: [
        { key: 'menstrual', label: 'Menstrual', value: 8, color: '#d94764' },
        { key: 'follicular', label: 'Follicular', value: 2, color: '#5aa469' },
        { key: 'ovulatory', label: 'Ovulatory', value: 3, color: '#f4a261' },
        { key: 'luteal', label: 'Luteal', value: 10, color: '#8b5fbf' },
      ],
      triggerData: [
        { label: 'Stress', value: 12, color: '#7f011f' },
        { label: 'Sleep Deprivation', value: 8, color: '#c0465f' },
        { label: 'Weather Change', value: 6, color: '#f4a261' },
        { label: 'Hormonal', value: 9, color: '#8b5fbf' },
      ],
      medicationData: [
        { name: 'Sumatriptan', stars: 4, insight: 'Effective 80% of the time' },
        { name: 'Propranolol', stars: 3, insight: 'Moderately effective' },
      ],
      trendData: [
        { month: 'Month 1', count: 8 },
        { month: 'Month 2', count: 5 },
        { month: 'Month 3', count: 4 },
      ],
      activityCalendar: [
        [1, 0, 2, 0, 1, 0, 0],
        [0, 1, 0, 2, 1, 0, 1],
        [2, 1, 0, 0, 1, 2, 0],
        [1, 0, 1, 0, 2, 1, 0],
        [0, 1, 0, 1, 0, 0, 1],
        [2, 0, 1, 0, 2, 0, 1],
      ],
    },
    year: {
      dateRangeLabel: 'Last 12 months',
      summaryStats: [
        { label: 'Total Migraines', value: '46' },
        { label: 'Average Intensity', value: '6.9/10' },
        { label: 'Avg Duration', value: '4.1 hrs' },
        { label: 'Triggered by Cycle', value: '61%' },
      ],
      phaseDistribution: [
        { key: 'menstrual', label: 'Menstrual', value: 15, color: '#d94764' },
        { key: 'follicular', label: 'Follicular', value: 6, color: '#5aa469' },
        { key: 'ovulatory', label: 'Ovulatory', value: 8, color: '#f4a261' },
        { key: 'luteal', label: 'Luteal', value: 25, color: '#8b5fbf' },
      ],
      triggerData: [
        { label: 'Stress', value: 29, color: '#7f011f' },
        { label: 'Sleep Deprivation', value: 20, color: '#c0465f' },
        { label: 'Weather Change', value: 17, color: '#f4a261' },
        { label: 'Hormonal', value: 24, color: '#8b5fbf' },
      ],
      medicationData: [
        { name: 'Sumatriptan', stars: 4, insight: 'Consistently effective across the year' },
        { name: 'Propranolol', stars: 3, insight: 'Helpful for reducing weekly spikes' },
      ],
      trendData: [
        { month: 'Q1', count: 15 },
        { month: 'Q2', count: 12 },
        { month: 'Q3', count: 10 },
        { month: 'Q4', count: 9 },
      ],
      activityCalendar: [
        [2, 1, 1, 0, 2, 1, 0],
        [1, 2, 0, 2, 1, 1, 0],
        [2, 1, 1, 0, 2, 1, 1],
        [1, 0, 2, 1, 0, 2, 1],
        [0, 1, 1, 2, 1, 0, 2],
        [1, 2, 0, 1, 2, 1, 0],
      ],
    },
  };

  // Extract data for the selected range

  const selectedInsights = insightsByRange[selectedRange];
  const summaryStats = selectedInsights.summaryStats;
  const phaseDistribution = selectedInsights.phaseDistribution;
  const triggerData = selectedInsights.triggerData;
  const medicationData = selectedInsights.medicationData;
  const trendData = selectedInsights.trendData;
  const activityCalendar = selectedInsights.activityCalendar;
  const hasData = true;
  const phaseMax = Math.max(...phaseDistribution.map((item) => item.value));
  const triggerMax = Math.max(...triggerData.map((item) => item.value));
  const trendMax = Math.max(...trendData.map((item) => item.count));
  const topPhase = phaseDistribution.reduce((best, current) => (current.value > best.value ? current : best), phaseDistribution[0]);
  const topTrigger = triggerData.reduce((best, current) => (current.value > best.value ? current : best), triggerData[0]);
  const secondTrigger = triggerData
    .filter((item) => item.label !== topTrigger.label)
    .reduce((best, current) => (current.value > best.value ? current : best), triggerData[0]);
  const firstTrendPoint = trendData[0]?.count || 0;
  const lastTrendPoint = trendData[trendData.length - 1]?.count || 0;
  const trendDirection = lastTrendPoint < irstTrendPoint ? 'decreased' : lastTrendPoint > firstTrendPoint ? 'increased' : 'remained steady';
  const activityMonthDate = new Date();
  activityMonthDate.setDate(1);
  activityMonthDate.setMonth(activityMonthDate.getMonth() + activityMonthOffset);
  const activityMonthLabel = activityMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const displayedActivityCalendar = useMemo(
    () => buildActivityCalendar(activityCalendar, activityMonthOffset),
    [activityCalendar, activityMonthOffset]
  );

  // Render the Insights screen

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.insightsHeader}>
          <Text style={styles.insightsTitle}>Your Insights</Text>
          <Text style={styles.insightsSubtitle}>Personalised patterns from your data</Text>
          <Text style={styles.insightsDateRange}>{selectedInsights.dateRangeLabel}</Text>
        </View>

        {!hasData ? (
          <View style={styles.insightsCard}>
            <Text style={styles.insightsCardTitle}>No insights yet</Text>
            <Text style={styles.insightsCardSubtitle}>Start logging migraines and cycle data to unlock personalised insights.</Text>
          </View>
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rangeToggleRow}>
              {rangeOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.rangeToggleChip,
                    selectedRange === option.key && styles.rangeToggleChipActive,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => setSelectedRange(option.key)}
                >
                  <Text style={[styles.rangeToggleChipText, selectedRange === option.key && styles.rangeToggleChipTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryStatsRow}>
              {summaryStats.map((stat) => (
                <View key={stat.label} style={styles.summaryStatCard}>
                  <Text style={styles.summaryStatLabel}>{stat.label}</Text>
                  <Text style={styles.summaryStatValue}>{stat.value}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.insightsCard, styles.activityInsightCard]}>
              <View style={styles.activityCardHeaderRow}>
                <Text style={styles.insightsCardTitle}>Migraine Activity</Text>
                <View style={styles.activityMonthControlWrap}>
                  <Pressable
                    style={styles.activityMonthArrow}
                    onPress={() => setActivityMonthOffset((prev) => prev - 1)}
                  >
                    <Text style={styles.activityMonthArrowText}>‹</Text>
                  </Pressable>
                  <Text style={styles.activityMonthLabel}>{activityMonthLabel}</Text>
                  <Pressable
                    style={styles.activityMonthArrow}
                    onPress={() => setActivityMonthOffset((prev) => prev + 1)}
                  >
                    <Text style={styles.activityMonthArrowText}>›</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.insightsCardSubtitle}>A larger visual map of lighter and heavier activity days for this period.</Text>
              <View style={styles.activityCalendarHeader}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <View key={day} style={styles.activityCalendarColumn}>
                    <Text style={styles.activityCalendarDayLabel}>{day}</Text>
                  </View>
                ))}
              </View>
              {displayedActivityCalendar.map((week, index) => (
                <View key={`week-${index}`} style={styles.activityCalendarRow}>
                  {week.map((level, dayIndex) => (
                    <View key={`cell-${index}-${dayIndex}`} style={styles.activityCalendarColumn}>
                      <View
                        style={[
                          styles.activityCalendarCell,
                          level === 1 && styles.activityCalendarCellMid,
                          level === 2 && styles.activityCalendarCellHigh,
                        ]}
                      />
                    </View>
                  ))}
                </View>
              ))}
              <View style={styles.activityLegendRow}>
                <View style={styles.activityLegendScale}>
                  <View style={[styles.activityLegendStep, styles.activityLegendStepFill, styles.activityLegendStepLow]} />
                  <View style={[styles.activityLegendStep, styles.activityLegendStepFill, styles.activityLegendStepMid]} />
                  <View style={[styles.activityLegendStep, styles.activityLegendStepFill, styles.activityLegendStepHigh]} />
                </View>
              </View>
              <View style={styles.activityLegendLabelsRow}>
                <Text style={styles.activityLegendText}>Low</Text>
                <Text style={styles.activityLegendText}>High</Text>
              </View>
            </View>

            <View style={[styles.insightsCard, styles.insightsPrimaryCard]}>
              <Text style={styles.insightsCardTitle}>Cycle-Migraine Correlation</Text>
              <Text style={styles.primaryInsightText}>You are 4x more likely to have a migraine 2 days before your period.</Text>
              {phaseDistribution.map((phase) => (
                <View key={phase.key} style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>{phase.label}</Text>
                  <View style={styles.analysisBarTrack}>
                    <View style={[styles.analysisBarFill, { width: `${(phase.value / phaseMax) * 100}%`, backgroundColor: phase.color }]} />
                  </View>
                  <Text style={styles.analysisValue}>({phase.value} migraines)</Text>
                </View>
              ))}
              <Text style={styles.insightNote}>
                In the {selectedInsights.dateRangeLabel.toLowerCase()}, your pattern shows the highest risk in the {topPhase.label} phase ({topPhase.value} migraines).
                We can focus your early warning reminders around this phase.
              </Text>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.insightsCardTitle}>Top Triggers</Text>
              {triggerData.map((trigger) => (
                <View key={trigger.label} style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>{trigger.label}</Text>
                  <View style={styles.analysisBarTrack}>
                    <View style={[styles.analysisBarFill, { width: `${(trigger.value / triggerMax) * 100}%`, backgroundColor: trigger.color }]} />
                  </View>
                  <Text style={styles.analysisValue}>({trigger.value} times)</Text>
                </View>
              ))}
              <Text style={styles.insightNote}>
                Your leading trigger is {topTrigger.label} ({topTrigger.value} logs), followed by {secondTrigger.label} ({secondTrigger.value}).
                A quick check-in before high-stress or hormonal days may help you catch attacks earlier.
              </Text>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.insightsCardTitle}>Medication Effectiveness</Text>
              {medicationData.map((medication) => (
                <View key={medication.name} style={styles.medicationInsightRow}>
                  <View>
                    <Text style={styles.medicationInsightName}>{medication.name}</Text>
                    <Text style={styles.medicationInsightStars}>{'★'.repeat(medication.stars)}{'☆'.repeat(5 - medication.stars)}</Text>
                  </View>
                  <Text style={styles.medicationInsightText}>{medication.insight}</Text>
                </View>
              ))}
              <Text style={styles.insightNote}>Sumatriptan is your most effective acute medication.</Text>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.insightsCardTitle}>Migraine Frequency Trends</Text>
              {trendData.map((trend) => (
                <View key={trend.month} style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>{trend.month}</Text>
                  <View style={styles.analysisBarTrack}>
                    <View style={[styles.analysisBarFill, { width: `${(trend.count / trendMax) * 100}%`, backgroundColor: '#7f011f' }]} />
                  </View>
                  <Text style={styles.analysisValue}>({trend.count})</Text>
                </View>
              ))}
              <Text style={styles.insightNote}>Your migraine frequency has {trendDirection} over {selectedInsights.dateRangeLabel.toLowerCase()}.</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.generateReportButton, pressed && styles.generateReportButtonPressed]}
              onPress={() => navigation.navigate('ReportPreview')}
            >
              <MaterialCommunityIcons name="file-pdf-box" size={20} color="#ffffff" />
              <Text style={styles.generateReportButtonText}>Generate Clinical Report (PDF)</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportPreviewScreen() {
  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.reportPreviewWrap}>
        <Text style={styles.reportPreviewTitle}>Clinical Report Preview</Text>
        <Text style={styles.reportPreviewText}>
          Your summary report is ready in this dummy preview. It includes cycle-linked migraine patterns, trigger frequency, and medication response trends.
        </Text>
        <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]} onPress={() => Alert.alert('Report generated', 'Your clinical report PDF was generated (dummy).')}>
          <MaterialCommunityIcons name="download" size={18} color="#ffffff" />
          <Text style={styles.submitButtonText}>Export PDF (Dummy)</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function EducationalContentScreen({ navigation }) {
  const [savedArticleIds, setSavedArticleIds] = useState([]);

  const toggleSaveArticle = (articleId) => {
    setSavedArticleIds((prev) => (prev.includes(articleId) ? prev.filter((item) => item !== articleId) : [...prev, articleId]));
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <View style={styles.sectionIconWrapper}>
              <MaterialCommunityIcons name="school-outline" size={22} color="#7f011f" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Educational Library</Text>
              <Text style={styles.sectionSubtitle}>Cycle, triggers, medication, and self-care guides</Text>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.headerCancelButton, pressed && styles.addButtonPressed]} onPress={() => navigation.goBack()}>
            <Text style={styles.headerCancelText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.educationSummaryCard}>
            <Text style={styles.educationSummaryTitle}>Personal learning hub</Text>
            <Text style={styles.educationSummaryText}>
              Explore {EDUCATION_ARTICLES.length} mock guides and open any article for a full-page read.
            </Text>
          </View>

          <View style={styles.educationArticleList}>
            {EDUCATION_ARTICLES.map((article) => {
              const saved = savedArticleIds.includes(article.id);
              return (
                <Pressable
                  key={article.id}
                  style={({ pressed }) => [styles.educationArticleCard, pressed && styles.addButtonPressed]}
                  onPress={() => navigation.navigate('EducationalArticle', { articleId: article.id })}
                >
                  <View style={styles.educationArticleTopRow}>
                    <View style={styles.educationArticleIconWrap}>
                      <MaterialCommunityIcons name={article.icon} size={18} color="#7f011f" />
                    </View>
                    <View style={styles.educationArticleCopy}>
                      <Text style={styles.educationArticleCategory}>{article.category}</Text>
                      <Text style={styles.educationArticleTitle}>{article.title}</Text>
                      <Text style={styles.educationArticleSubtitle}>{article.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.educationArticleMetaRow}>
                    <Text style={styles.educationArticleMeta}>{article.readTime} • Updated {article.lastUpdated}</Text>
                    <Pressable style={({ pressed }) => [styles.smallGhostButton, pressed && styles.addButtonPressed]} onPress={() => toggleSaveArticle(article.id)}>
                      <Text style={styles.smallGhostButtonText}>{saved ? 'Saved' : 'Save'}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EducationalArticleScreen({ navigation, route }) {
  const articleId = route.params?.articleId || EDUCATION_ARTICLES[0].id;
  const article = EDUCATION_ARTICLES.find((item) => item.id === articleId) || EDUCATION_ARTICLES[0];

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <View style={styles.sectionIconWrapper}>
              <MaterialCommunityIcons name={article.icon} size={22} color="#7f011f" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Article</Text>
              <Text style={styles.sectionSubtitle}>{article.category}</Text>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.headerCancelButton, pressed && styles.addButtonPressed]} onPress={() => navigation.goBack()}>
            <Text style={styles.headerCancelText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.educationDetailCard}>
            <Text style={styles.educationDetailTitle}>{article.title}</Text>
            <Text style={styles.educationArticleMeta}>{article.readTime} • Updated {article.lastUpdated}</Text>
            <Text style={styles.educationDetailTakeaway}>Key takeaway: {article.keyTakeaway}</Text>

            {article.sections.map((section) => (
              <View key={`${article.id}-${section.heading}`} style={styles.educationDetailSection}>
                <Text style={styles.educationDetailSectionTitle}>{section.heading}</Text>
                <Text style={styles.educationDetailSectionText}>{section.body}</Text>
              </View>
            ))}

            <Text style={styles.educationDetailSectionTitle}>Practical tips</Text>
            <View style={styles.educationTipsList}>
              {article.practicalTips.map((tip) => (
                <View key={`${article.id}-${tip}`} style={styles.educationTipRow}>
                  <View style={styles.educationTipDot} />
                  <Text style={styles.educationTipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MoreScreen({ navigation }) {
  const handleLogout = () => {
    const rootNavigation = navigation.getParent()?.getParent();
    if (rootNavigation) {
      rootNavigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <SectionHeader icon="dots-horizontal" title="More" subtitle="Settings & options" />

        <MenuItem icon="account" label="Manage Account" onPress={() => navigation.navigate('ManageAccount')} />
        <MenuItem icon="account-group" label="Shared Access" onPress={() => navigation.navigate('ManageSharingPermissions')} />
        <MenuItem icon="bell" label="Notifications" onPress={() => navigation.navigate('NotificationsSettings')} />
        <MenuItem icon="information" label="About" onPress={() => Alert.alert('About', 'Miss Migraine v1.0')} />
        <MenuItem icon="logout" label="Logout" onPress={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationsSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    masterEnabled: true,
    dailyLogReminder: true,
    reminderTime: '8:00 PM',
    reminderFrequency: 'Daily',
    incompleteLogReminder: true,
    quickLogConfirmation: true,
    upcomingPeriodReminder: true,
    periodReminderDays: '2',
    perimenstrualWindowAlert: true,
    ovulationReminder: false,
    weeklyInsightSummary: true,
    weeklyInsightDay: 'Monday',
    monthlyReportReady: true,
    newPatternDetected: true,
    weatherChangeAlerts: true,
    pressureThreshold: '10',
    dailyWeatherForecast: false,
    notificationSound: true,
    vibration: true,
    showOnLockScreen: true,
    notificationTone: 'Default',
    dndMode: false,
    dndStartTime: '10:00 PM',
    dndEndTime: '7:00 AM',
    allowEmergencyDuringDnd: true,
  });
  const [pickerOpen, setPickerOpen] = useState({
    reminderTime: false,
    reminderFrequency: false,
    periodReminderDays: false,
    weeklyInsightDay: false,
    pressureThreshold: false,
    notificationTone: false,
    dndStartTime: false,
    dndEndTime: false,
  });

  const updateSetting = (field, value) => {
    if (!settings.masterEnabled && field !== 'masterEnabled') {
      return;
    }
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSetting = (field) => {
    if (!settings.masterEnabled && field !== 'masterEnabled') {
      return;
    }
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const togglePicker = (field) => {
    if (!settings.masterEnabled) {
      return;
    }
    setPickerOpen((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const renderChoiceRow = (field, options) => (
    <View style={styles.notificationsOptionRow}>
      {options.map((option) => {
        const active = settings[field] === option;
        return (
          <Pressable
            key={`${field}-${option}`}
            disabled={!settings.masterEnabled}
            style={({ pressed }) => [
              styles.notificationsOptionChip,
              active && styles.notificationsOptionChipActive,
              !settings.masterEnabled && styles.notificationsDisabledCard,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => updateSetting(field, option)}
          >
            <Text style={[styles.notificationsOptionChipText, active && styles.notificationsOptionChipTextActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const activeCount = [
    settings.dailyLogReminder,
    settings.incompleteLogReminder,
    settings.quickLogConfirmation,
    settings.upcomingPeriodReminder,
    settings.perimenstrualWindowAlert,
    settings.ovulationReminder,
    settings.weeklyInsightSummary,
    settings.monthlyReportReady,
    settings.newPatternDetected,
    settings.weatherChangeAlerts,
    settings.dailyWeatherForecast,
  ].filter(Boolean).length;

  // Notification settings screen

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <View style={styles.sectionIconWrapper}>
              <MaterialCommunityIcons name="bell-cog-outline" size={22} color="#7f011f" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <Text style={styles.sectionSubtitle}>Manage your notification preferences</Text>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.headerCancelButton, pressed && styles.addButtonPressed]} onPress={() => navigation.goBack()}>
            <Text style={styles.headerCancelText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.accountCard}>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Enable All Notifications</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.masterEnabled && styles.toggleButtonActive,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('masterEnabled')}
                >
                  <Text style={[styles.toggleButtonText, settings.masterEnabled && styles.toggleButtonTextActive]}>
                    {settings.masterEnabled ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.notificationsSectionHeader}>Logging Reminders</Text>
          <View style={[styles.accountCard, !settings.masterEnabled && styles.notificationsSectionDisabled]}>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Daily Log Reminder</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.dailyLogReminder && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('dailyLogReminder')}
                >
                  <Text style={[styles.toggleButtonText, settings.dailyLogReminder && styles.toggleButtonTextActive]}>
                    {settings.dailyLogReminder ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
              {settings.masterEnabled && settings.dailyLogReminder && (
                <View style={styles.notificationsExpandedBlock}>
                  <Pressable style={({ pressed }) => [styles.notificationsPickerTrigger, pressed && styles.addButtonPressed]} onPress={() => togglePicker('reminderTime')}>
                    <Text style={styles.notificationsPickerLabel}>Reminder Time</Text>
                    <Text style={styles.notificationsPickerValue}>{settings.reminderTime}</Text>
                  </Pressable>
                  {pickerOpen.reminderTime && renderChoiceRow('reminderTime', ['7:00 PM', '8:00 PM', '9:00 PM'])}

                  <Pressable style={({ pressed }) => [styles.notificationsPickerTrigger, pressed && styles.addButtonPressed]} onPress={() => togglePicker('reminderFrequency')}>
                    <Text style={styles.notificationsPickerLabel}>How often?</Text>
                    <Text style={styles.notificationsPickerValue}>{settings.reminderFrequency}</Text>
                  </Pressable>
                  {pickerOpen.reminderFrequency && renderChoiceRow('reminderFrequency', ['Daily', 'Weekly', 'Never'])}
                </View>
              )}
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Incomplete Log Reminder</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.incompleteLogReminder && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('incompleteLogReminder')}
                >
                  <Text style={[styles.toggleButtonText, settings.incompleteLogReminder && styles.toggleButtonTextActive]}>
                    {settings.incompleteLogReminder ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Quick Log Confirmation</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.quickLogConfirmation && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('quickLogConfirmation')}
                >
                  <Text style={[styles.toggleButtonText, settings.quickLogConfirmation && styles.toggleButtonTextActive]}>
                    {settings.quickLogConfirmation ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.notificationsSectionHeader}>Cycle & Menstrual Reminders</Text>
          <View style={[styles.accountCard, !settings.masterEnabled && styles.notificationsSectionDisabled]}>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Upcoming Period Reminder</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.upcomingPeriodReminder && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('upcomingPeriodReminder')}
                >
                  <Text style={[styles.toggleButtonText, settings.upcomingPeriodReminder && styles.toggleButtonTextActive]}>
                    {settings.upcomingPeriodReminder ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
              {settings.masterEnabled && settings.upcomingPeriodReminder && (
                <View style={styles.notificationsExpandedBlock}>
                  <Pressable style={({ pressed }) => [styles.notificationsPickerTrigger, pressed && styles.addButtonPressed]} onPress={() => togglePicker('periodReminderDays')}>
                    <Text style={styles.notificationsPickerLabel}>Remind me X days before period</Text>
                    <Text style={styles.notificationsPickerValue}>{settings.periodReminderDays} days</Text>
                  </Pressable>
                  {pickerOpen.periodReminderDays && renderChoiceRow('periodReminderDays', ['1', '2', '3', '4', '5'])}
                </View>
              )}
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Perimenstrual Window Alert</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.perimenstrualWindowAlert && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('perimenstrualWindowAlert')}
                >
                  <Text style={[styles.toggleButtonText, settings.perimenstrualWindowAlert && styles.toggleButtonTextActive]}>
                    {settings.perimenstrualWindowAlert ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Ovulation Reminder</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.ovulationReminder && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('ovulationReminder')}
                >
                  <Text style={[styles.toggleButtonText, settings.ovulationReminder && styles.toggleButtonTextActive]}>
                    {settings.ovulationReminder ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.notificationsSectionHeader}>Insights & Reports</Text>
          <View style={[styles.accountCard, !settings.masterEnabled && styles.notificationsSectionDisabled]}>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Weekly Insight Summary</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.weeklyInsightSummary && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('weeklyInsightSummary')}
                >
                  <Text style={[styles.toggleButtonText, settings.weeklyInsightSummary && styles.toggleButtonTextActive]}>
                    {settings.weeklyInsightSummary ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
              {settings.masterEnabled && settings.weeklyInsightSummary && (
                <View style={styles.notificationsExpandedBlock}>
                  <Pressable style={({ pressed }) => [styles.notificationsPickerTrigger, pressed && styles.addButtonPressed]} onPress={() => togglePicker('weeklyInsightDay')}>
                    <Text style={styles.notificationsPickerLabel}>Send on</Text>
                    <Text style={styles.notificationsPickerValue}>{settings.weeklyInsightDay}</Text>
                  </Pressable>
                  {pickerOpen.weeklyInsightDay &&
                    renderChoiceRow('weeklyInsightDay', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])}
                </View>
              )}
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Monthly Report Ready</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.monthlyReportReady && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('monthlyReportReady')}
                >
                  <Text style={[styles.toggleButtonText, settings.monthlyReportReady && styles.toggleButtonTextActive]}>
                    {settings.monthlyReportReady ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>New Pattern Detected</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.newPatternDetected && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('newPatternDetected')}
                >
                  <Text style={[styles.toggleButtonText, settings.newPatternDetected && styles.toggleButtonTextActive]}>
                    {settings.newPatternDetected ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.notificationsSectionHeader}>Weather Alerts</Text>
          <View style={[styles.accountCard, !settings.masterEnabled && styles.notificationsSectionDisabled]}>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Weather Change Alerts</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.weatherChangeAlerts && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('weatherChangeAlerts')}
                >
                  <Text style={[styles.toggleButtonText, settings.weatherChangeAlerts && styles.toggleButtonTextActive]}>
                    {settings.weatherChangeAlerts ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
              {settings.masterEnabled && settings.weatherChangeAlerts && (
                <View style={styles.notificationsExpandedBlock}>
                  <Pressable style={({ pressed }) => [styles.notificationsPickerTrigger, pressed && styles.addButtonPressed]} onPress={() => togglePicker('pressureThreshold')}>
                    <Text style={styles.notificationsPickerLabel}>Alert when pressure changes by X hPa</Text>
                    <Text style={styles.notificationsPickerValue}>{settings.pressureThreshold} hPa</Text>
                  </Pressable>
                  {pickerOpen.pressureThreshold && renderChoiceRow('pressureThreshold', ['5', '10', '15', '20'])}
                </View>
              )}
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Daily Weather Forecast</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.dailyWeatherForecast && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('dailyWeatherForecast')}
                >
                  <Text style={[styles.toggleButtonText, settings.dailyWeatherForecast && styles.toggleButtonTextActive]}>
                    {settings.dailyWeatherForecast ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.notificationsSectionHeader}>Sound & Appearance</Text>
          <View style={[styles.accountCard, !settings.masterEnabled && styles.notificationsSectionDisabled]}>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Notification Sound</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.notificationSound && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('notificationSound')}
                >
                  <Text style={[styles.toggleButtonText, settings.notificationSound && styles.toggleButtonTextActive]}>
                    {settings.notificationSound ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Vibration</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.vibration && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('vibration')}
                >
                  <Text style={[styles.toggleButtonText, settings.vibration && styles.toggleButtonTextActive]}>
                    {settings.vibration ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Show on Lock Screen</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.showOnLockScreen && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('showOnLockScreen')}
                >
                  <Text style={[styles.toggleButtonText, settings.showOnLockScreen && styles.toggleButtonTextActive]}>
                    {settings.showOnLockScreen ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.notificationsItemCard}>
              <Pressable
                disabled={!settings.masterEnabled}
                style={({ pressed }) => [styles.notificationsPickerTrigger, !settings.masterEnabled && styles.notificationsDisabledCard, pressed && styles.addButtonPressed]}
                onPress={() => togglePicker('notificationTone')}
              >
                <Text style={styles.notificationsPickerLabel}>Notification Tone</Text>
                <Text style={styles.notificationsPickerValue}>{settings.notificationTone}</Text>
              </Pressable>
              {settings.masterEnabled && pickerOpen.notificationTone && renderChoiceRow('notificationTone', ['Default', 'Gentle', 'Alert', 'Calm', 'Soft'])}
            </View>
          </View>

          <Text style={styles.notificationsSectionHeader}>Do Not Disturb</Text>
          <View style={[styles.accountCard, !settings.masterEnabled && styles.notificationsSectionDisabled]}>
            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Do Not Disturb Mode</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.dndMode && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('dndMode')}
                >
                  <Text style={[styles.toggleButtonText, settings.dndMode && styles.toggleButtonTextActive]}>
                    {settings.dndMode ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
              {settings.masterEnabled && settings.dndMode && (
                <View style={styles.notificationsExpandedBlock}>
                  <Pressable style={({ pressed }) => [styles.notificationsPickerTrigger, pressed && styles.addButtonPressed]} onPress={() => togglePicker('dndStartTime')}>
                    <Text style={styles.notificationsPickerLabel}>Start Time</Text>
                    <Text style={styles.notificationsPickerValue}>{settings.dndStartTime}</Text>
                  </Pressable>
                  {pickerOpen.dndStartTime && renderChoiceRow('dndStartTime', ['9:00 PM', '10:00 PM', '11:00 PM'])}
                  <Pressable style={({ pressed }) => [styles.notificationsPickerTrigger, pressed && styles.addButtonPressed]} onPress={() => togglePicker('dndEndTime')}>
                    <Text style={styles.notificationsPickerLabel}>End Time</Text>
                    <Text style={styles.notificationsPickerValue}>{settings.dndEndTime}</Text>
                  </Pressable>
                  {pickerOpen.dndEndTime && renderChoiceRow('dndEndTime', ['6:00 AM', '7:00 AM', '8:00 AM'])}
                </View>
              )}
            </View>

            <View style={styles.notificationsItemCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.notificationsItemTitle}>Allow Emergency Alerts During DND</Text>
                <Pressable
                  disabled={!settings.masterEnabled}
                  style={({ pressed }) => [
                    styles.toggleButton,
                    settings.allowEmergencyDuringDnd && styles.toggleButtonActive,
                    !settings.masterEnabled && styles.notificationsDisabledCard,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => toggleSetting('allowEmergencyDuringDnd')}
                >
                  <Text style={[styles.toggleButtonText, settings.allowEmergencyDuringDnd && styles.toggleButtonTextActive]}>
                    {settings.allowEmergencyDuringDnd ? 'On' : 'Off'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ManageSharingPermissionsScreen({ navigation }) {
  const [sharingCode, setSharingCode] = useState(SHARING_DEFAULT_CODE);
  const [trustedPersons, setTrustedPersons] = useState(() => createInitialTrustedPersons());
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  const [sharingCodeInput, setSharingCodeInput] = useState('');
  const [trustedEmailInput, setTrustedEmailInput] = useState('');
  const [editingTrustedPersonId, setEditingTrustedPersonId] = useState(null);
  const [accessLevelDraft, setAccessLevelDraft] = useState('limited');
  const [permissionDraft, setPermissionDraft] = useState(getPermissionsForAccessLevel('limited'));

  const editingTrustedPerson = trustedPersons.find((person) => person.id === editingTrustedPersonId) || null;

  const copySharingCode = () => {
    Clipboard.setStringAsync(sharingCode)
      .then(() => {
        Alert.alert('Code copied', 'Sharing code copied to clipboard.');
      })
      .catch(() => {
        Alert.alert('Unable to copy', 'Could not copy right now. Please copy the code manually.');
      });
  };

  const regenerateSharingCode = () => {
    const nextCode = generateSharingCode();
    setSharingCode(nextCode);
    Alert.alert('Code regenerated', 'Your old sharing code is now invalid.');
  };

  const openAddTrustedModal = () => {
    setSharingCodeInput('');
    setTrustedEmailInput('');
    setAddModalVisible(true);
  };

  const closeAddTrustedModal = () => {
    setAddModalVisible(false);
    setSharingCodeInput('');
    setTrustedEmailInput('');
  };

  const verifyAndAddTrustedPerson = () => {
    const normalizedInputCode = sharingCodeInput.trim().toUpperCase();
    if (!normalizedInputCode) {
      Alert.alert('Code required', 'Please enter the sharing code.');
      return;
    }
    if (normalizedInputCode !== sharingCode) {
      Alert.alert('Invalid code', 'Invalid code. Please try again.');
      return;
    }

    const normalizedEmail = trustedEmailInput.trim().toLowerCase();
    if (normalizedEmail) {
      const exists = trustedPersons.some((person) => person.email.toLowerCase() === normalizedEmail);
      if (exists) {
        Alert.alert('Already added', 'This trusted person is already in your access list.');
        return;
      }
    }

    const nextIndex = trustedPersons.length + 1;
    const nextTrustedPerson = {
      id: `trusted-${Date.now()}`,
      name: deriveTrustedPersonName(normalizedEmail, nextIndex),
      email: normalizedEmail || `not-provided-${nextIndex}@example.com`,
      status: 'active',
      accessLevelKey: 'limited',
      permissions: getPermissionsForAccessLevel('limited'),
    };

    setTrustedPersons((prev) => [nextTrustedPerson, ...prev]);
    closeAddTrustedModal();
    Alert.alert('Code verified!', 'Trusted person added.');
  };

  const openModifyAccessModal = (person) => {
    setEditingTrustedPersonId(person.id);
    setAccessLevelDraft(person.accessLevelKey);
    setPermissionDraft({ ...person.permissions });
    setModifyModalVisible(true);
  };

  const closeModifyAccessModal = () => {
    setModifyModalVisible(false);
    setEditingTrustedPersonId(null);
  };

  const changeAccessLevelDraft = (levelKey) => {
    setAccessLevelDraft(levelKey);
    setPermissionDraft(getPermissionsForAccessLevel(levelKey));
  };

  const togglePermissionDraft = (field) => {
    setPermissionDraft((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const saveAccessChanges = () => {
    if (!editingTrustedPersonId) {
      return;
    }

    setTrustedPersons((prev) =>
      prev.map((person) =>
        person.id === editingTrustedPersonId
          ? {
              ...person,
              accessLevelKey: accessLevelDraft,
              permissions: { ...permissionDraft },
            }
          : person
      )
    );
    closeModifyAccessModal();
    Alert.alert('Saved', 'Sharing permissions updated.');
  };

  const revokeAccess = (person) => {
    Alert.alert(
      'Revoke Access?',
      `Are you sure you want to revoke ${person.name}'s access? They will no longer be able to view your data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: () => {
            setTrustedPersons((prev) => prev.filter((item) => item.id !== person.id));
            Alert.alert('Access revoked', `${person.name} was removed from your trusted list.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <View style={styles.sectionIconWrapper}>
              <MaterialCommunityIcons name="account-group-outline" size={22} color="#7f011f" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Shared Access</Text>
              <Text style={styles.sectionSubtitle}>Manage who can view your migraine data</Text>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.headerCancelButton, pressed && styles.addButtonPressed]} onPress={() => navigation.goBack()}>
            <Text style={styles.headerCancelText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Your Sharing Code</Text>
            <Text style={styles.accountSectionSubtitle}>
              Share this code with someone you trust. They will use it to register as your trusted person.
            </Text>
            <View style={styles.sharingCodeBox}>
              <Text style={styles.sharingCodeText}>{sharingCode}</Text>
            </View>
            <View style={styles.sharingCodeActions}>
              <Pressable style={({ pressed }) => [styles.submitButton, styles.sharingCodeActionButton, pressed && styles.submitButtonPressed]} onPress={copySharingCode}>
                <MaterialCommunityIcons name="content-copy" size={16} color="#ffffff" />
                <Text style={styles.submitButtonText}>Copy Code</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.cancelButton, styles.sharingCodeActionButton, pressed && styles.cancelButtonPressed]} onPress={regenerateSharingCode}>
                <MaterialCommunityIcons name="refresh" size={16} color="#7f011f" />
                <Text style={styles.cancelButtonText}>Regenerate Code</Text>
              </Pressable>
            </View>
            <Text style={styles.sharingCodeNote}>Regenerating will invalidate the previous code.</Text>
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Your Trusted Persons</Text>
            <Text style={styles.accountSectionSubtitle}>People who have access to your shared data</Text>

            {trustedPersons.length === 0 ? (
              <View style={styles.sharingEmptyState}>
                <MaterialCommunityIcons name="account-off-outline" size={34} color="#b7aeb2" />
                <Text style={styles.sharingEmptyStateTitle}>No trusted persons yet</Text>
                <Text style={styles.sharingEmptyStateSubtitle}>Add someone using your sharing code to get started.</Text>
              </View>
            ) : (
              <View style={styles.sharingTrustedList}>
                {trustedPersons.map((person) => {
                  const accessLevel = SHARING_ACCESS_LEVELS.find((level) => level.key === person.accessLevelKey);
                  const statusActive = person.status === 'active';
                  return (
                    <View key={person.id} style={styles.sharingTrustedCard}>
                      <View style={styles.sharingTrustedTopRow}>
                        <View style={styles.sharingTrustedCopy}>
                          <Text style={styles.sharingTrustedName}>{person.name}</Text>
                          <Text style={styles.sharingTrustedEmail}>{person.email}</Text>
                        </View>
                        <View style={[styles.sharingStatusBadge, statusActive ? styles.sharingStatusBadgeActive : styles.sharingStatusBadgeInactive]}>
                          <Text style={[styles.sharingStatusBadgeText, statusActive ? styles.sharingStatusBadgeTextActive : styles.sharingStatusBadgeTextInactive]}>
                            {statusActive ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.sharingTrustedAccess}>Access: {accessLevel ? accessLevel.label : 'Limited Access'}</Text>
                      <View style={styles.sharingTrustedActions}>
                        <Pressable style={({ pressed }) => [styles.smallGhostButton, pressed && styles.addButtonPressed]} onPress={() => openModifyAccessModal(person)}>
                          <Text style={styles.smallGhostButtonText}>Modify Access</Text>
                        </Pressable>
                        <Pressable style={({ pressed }) => [styles.sharingDangerGhostButton, pressed && styles.addButtonPressed]} onPress={() => revokeAccess(person)}>
                          <Text style={styles.sharingDangerGhostButtonText}>Revoke Access</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]} onPress={openAddTrustedModal}>
            <MaterialCommunityIcons name="account-plus-outline" size={18} color="#ffffff" />
            <Text style={styles.submitButtonText}>Add Trusted Person</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={closeAddTrustedModal}>
        <View style={styles.recordsModalBackdrop}>
          <View style={styles.recordsModalCard}>
            <Text style={styles.recordsModalTitle}>Add Trusted Person</Text>
            <Text style={styles.recordsModalLabel}>Enter the code your trusted person received from you</Text>
            <ScrollView contentContainerStyle={styles.recordsModalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.recordsModalLabel}>Enter Sharing Code</Text>
              <TextInput
                style={styles.addFormInput}
                placeholder="XXX-XXX-XXX"
                placeholderTextColor="#a0a0a0"
                autoCapitalize="characters"
                value={sharingCodeInput}
                onChangeText={(value) => setSharingCodeInput(value.toUpperCase())}
              />
              <Text style={styles.recordsModalLabel}>Trusted Person's Email (optional)</Text>
              <TextInput
                style={styles.addFormInput}
                placeholder="trusted@example.com"
                placeholderTextColor="#a0a0a0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={trustedEmailInput}
                onChangeText={setTrustedEmailInput}
              />
            </ScrollView>
            <View style={styles.recordsModalActions}>
              <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]} onPress={closeAddTrustedModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.submitButton, styles.submitButtonHalf, pressed && styles.submitButtonPressed]} onPress={verifyAndAddTrustedPerson}>
                <Text style={styles.submitButtonText}>Verify Code</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modifyModalVisible} transparent animationType="slide" onRequestClose={closeModifyAccessModal}>
        <View style={styles.recordsModalBackdrop}>
          <View style={styles.recordsModalCard}>
            <Text style={styles.recordsModalTitle}>
              Modify Access for {editingTrustedPerson ? editingTrustedPerson.name : 'Trusted Person'}
            </Text>
            <ScrollView contentContainerStyle={styles.recordsModalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.recordsModalLabel}>Access Level</Text>
              <View style={styles.sharingAccessLevelList}>
                {SHARING_ACCESS_LEVELS.map((level) => (
                  <Pressable
                    key={level.key}
                    style={({ pressed }) => [
                      styles.sharingAccessLevelCard,
                      accessLevelDraft === level.key && styles.sharingAccessLevelCardActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => changeAccessLevelDraft(level.key)}
                  >
                    <Text style={[styles.sharingAccessLevelTitle, accessLevelDraft === level.key && styles.sharingAccessLevelTitleActive]}>{level.label}</Text>
                    <Text style={[styles.sharingAccessLevelDescription, accessLevelDraft === level.key && styles.sharingAccessLevelDescriptionActive]}>
                      {level.description}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.recordsModalLabel}>Data Permissions</Text>
              <View style={styles.sharingPermissionList}>
                <Pressable style={({ pressed }) => [styles.sharingPermissionRow, pressed && styles.addButtonPressed]} onPress={() => togglePermissionDraft('viewLogs')}>
                  <MaterialCommunityIcons name={permissionDraft.viewLogs ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={permissionDraft.viewLogs ? '#7f011f' : '#9a8f94'} />
                  <Text style={styles.sharingPermissionLabel}>View Migraine Logs</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.sharingPermissionRow, pressed && styles.addButtonPressed]} onPress={() => togglePermissionDraft('viewCycle')}>
                  <MaterialCommunityIcons name={permissionDraft.viewCycle ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={permissionDraft.viewCycle ? '#7f011f' : '#9a8f94'} />
                  <Text style={styles.sharingPermissionLabel}>View Cycle Data</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.sharingPermissionRow, pressed && styles.addButtonPressed]} onPress={() => togglePermissionDraft('viewInsights')}>
                  <MaterialCommunityIcons name={permissionDraft.viewInsights ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={permissionDraft.viewInsights ? '#7f011f' : '#9a8f94'} />
                  <Text style={styles.sharingPermissionLabel}>View Insights</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.sharingPermissionRow, pressed && styles.addButtonPressed]} onPress={() => togglePermissionDraft('emergencyAlerts')}>
                  <MaterialCommunityIcons name={permissionDraft.emergencyAlerts ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={permissionDraft.emergencyAlerts ? '#7f011f' : '#9a8f94'} />
                  <Text style={styles.sharingPermissionLabel}>Receive Emergency Alerts</Text>
                </Pressable>
              </View>
            </ScrollView>
            <View style={styles.recordsModalActions}>
              <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]} onPress={closeModifyAccessModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.submitButton, styles.submitButtonHalf, pressed && styles.submitButtonPressed]} onPress={saveAccessChanges}>
                <Text style={styles.submitButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ManageAccountScreen({ navigation }) {
  const [profile, setProfile] = useState(DEFAULT_ACCOUNT_PROFILE);
  const [newCommonSymptom, setNewCommonSymptom] = useState('');

  const updateProfile = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateNotificationPreference = (field) => {
    setProfile((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [field]: !prev.notificationPreferences[field],
      },
    }));
  };

  const addCommonSymptom = () => {
    const trimmed = newCommonSymptom.trim();
    if (!trimmed) {
      Alert.alert('Required', 'Please enter a symptom to add.');
      return;
    }
    const exists = profile.commonSymptoms.some((symptom) => symptom.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      Alert.alert('Already exists', 'That symptom is already saved.');
      return;
    }
    setProfile((prev) => ({
      ...prev,
      commonSymptoms: [...prev.commonSymptoms, trimmed],
    }));
    setNewCommonSymptom('');
  };

  const removeCommonSymptom = (symptomToRemove) => {
    setProfile((prev) => ({
      ...prev,
      commonSymptoms: prev.commonSymptoms.filter((symptom) => symptom !== symptomToRemove),
    }));
  };

  const handleSaveAccount = () => {
    Alert.alert('Saved', 'Account details updated successfully (dummy).');
  };

  const handleResetAccount = () => {
    setProfile(DEFAULT_ACCOUNT_PROFILE);
    setNewCommonSymptom('');
    Alert.alert('Reset', 'Account details reset to sample values.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This is a dummy confirmation only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted', 'Your account and associated data were deleted (dummy).');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <View style={styles.sectionIconWrapper}>
              <MaterialCommunityIcons name="account-cog-outline" size={22} color="#7f011f" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Manage Account</Text>
              <Text style={styles.sectionSubtitle}>View and update your personal details</Text>
            </View>
          </View>
          <Pressable style={({ pressed }) => [styles.headerCancelButton, pressed && styles.addButtonPressed]} onPress={() => navigation.goBack()}>
            <Text style={styles.headerCancelText}>Back</Text>
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Personal Details</Text>
            <Text style={styles.accountSectionSubtitle}>Basic profile information used across the app.</Text>

            <FormGroup label="Full Name">
              <TextInput
                style={styles.textInput}
                placeholder="Full name"
                value={profile.fullName}
                onChangeText={(value) => updateProfile('fullName', value)}
              />
            </FormGroup>

            <FormGroup label="Preferred Name">
              <TextInput
                style={styles.textInput}
                placeholder="Preferred name"
                value={profile.preferredName}
                onChangeText={(value) => updateProfile('preferredName', value)}
              />
            </FormGroup>

            <FormGroup label="Email">
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={profile.email}
                onChangeText={(value) => updateProfile('email', value)}
              />
            </FormGroup>
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Migraine Profile</Text>
            <Text style={styles.accountSectionSubtitle}>Matches the key fields from your profile database.</Text>

            <FormGroup label="Cycle Length Average">
              <TextInput
                style={styles.textInput}
                placeholder="Average cycle length"
                keyboardType="number-pad"
                value={profile.cycleLengthAvg}
                onChangeText={(value) => updateProfile('cycleLengthAvg', value)}
              />
            </FormGroup>

            <FormGroup label="Cycle Regularity">
              <View style={styles.optionChipsContainer}>
                {['regular', 'irregular', 'unsure'].map((option) => {
                  const selected = profile.cycleRegularity === option;
                  return (
                    <Pressable
                      key={option}
                      style={({ pressed }) => [
                        styles.optionChip,
                        selected && styles.optionChipActive,
                        pressed && styles.addButtonPressed,
                      ]}
                      onPress={() => updateProfile('cycleRegularity', option)}
                    >
                      <Text style={[styles.optionChipText, selected && styles.optionChipTextActive]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </FormGroup>

            <FormGroup label="Aura Present">
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>History of migraine aura</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.toggleButton,
                    profile.auraPresent && styles.toggleButtonActive,
                    pressed && styles.addButtonPressed,
                  ]}
                  onPress={() => updateProfile('auraPresent', !profile.auraPresent)}
                >
                  <Text style={[styles.toggleButtonText, profile.auraPresent && styles.toggleButtonTextActive]}>
                    {profile.auraPresent ? 'Yes' : 'No'}
                  </Text>
                </Pressable>
              </View>
            </FormGroup>

            <View style={styles.inlineInputRow}>
              <View style={styles.flexField}>
                <FormGroup label="Age of Onset">
                  <TextInput
                    style={styles.textInput}
                    placeholder="Age"
                    keyboardType="number-pad"
                    value={profile.ageOfOnset}
                    onChangeText={(value) => updateProfile('ageOfOnset', value)}
                  />
                </FormGroup>
              </View>
              <View style={styles.flexField}>
                <FormGroup label="Avg Frequency">
                  <TextInput
                    style={styles.textInput}
                    placeholder="Per month"
                    keyboardType="number-pad"
                    value={profile.avgFrequency}
                    onChangeText={(value) => updateProfile('avgFrequency', value)}
                  />
                </FormGroup>
              </View>
            </View>

            <FormGroup label="Avg Intensity">
              <View style={styles.sliderContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Pressable
                    key={num}
                    style={[styles.intensityButton, profile.avgIntensity === num && styles.intensityButtonActive]}
                    onPress={() => updateProfile('avgIntensity', num)}
                  >
                    <Text style={[styles.intensityText, profile.avgIntensity === num && styles.intensityTextActive]}>
                      {num}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </FormGroup>
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Common Symptoms</Text>
            <Text style={styles.accountSectionSubtitle}>Update the symptoms you most commonly experience.</Text>

            <View style={styles.tagsContainer}>
              {profile.commonSymptoms.map((symptom) => (
                <View key={symptom} style={styles.tag}>
                  <Text style={styles.tagText}>{symptom}</Text>
                  <Pressable onPress={() => removeCommonSymptom(symptom)}>
                    <MaterialCommunityIcons name="close" size={14} color="#8B4789" />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="Add common symptom"
                placeholderTextColor="#a0a0a0"
                value={newCommonSymptom}
                onChangeText={setNewCommonSymptom}
              />
              <Pressable style={({ pressed }) => [styles.inlineAddButton, pressed && styles.addButtonPressed]} onPress={addCommonSymptom}>
                <Text style={styles.inlineAddButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Preferences & Consent</Text>
            <Text style={styles.accountSectionSubtitle}>Control sharing, notifications, and onboarding state.</Text>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceTitle}>Data Sharing Consent</Text>
                <Text style={styles.preferenceSubtitle}>Allow approved data sharing for research or care support.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButton,
                  profile.dataSharingConsent && styles.toggleButtonActive,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => updateProfile('dataSharingConsent', !profile.dataSharingConsent)}
              >
                <Text style={[styles.toggleButtonText, profile.dataSharingConsent && styles.toggleButtonTextActive]}>
                  {profile.dataSharingConsent ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceTitle}>Logging Reminders</Text>
                <Text style={styles.preferenceSubtitle}>Prompt to record attacks and medication effectiveness.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButton,
                  profile.notificationPreferences.loggingReminders && styles.toggleButtonActive,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => updateNotificationPreference('loggingReminders')}
              >
                <Text style={[styles.toggleButtonText, profile.notificationPreferences.loggingReminders && styles.toggleButtonTextActive]}>
                  {profile.notificationPreferences.loggingReminders ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceTitle}>Cycle Reminders</Text>
                <Text style={styles.preferenceSubtitle}>Get nudges around your predicted cycle window.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButton,
                  profile.notificationPreferences.cycleReminders && styles.toggleButtonActive,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => updateNotificationPreference('cycleReminders')}
              >
                <Text style={[styles.toggleButtonText, profile.notificationPreferences.cycleReminders && styles.toggleButtonTextActive]}>
                  {profile.notificationPreferences.cycleReminders ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceTitle}>Weather Alerts</Text>
                <Text style={styles.preferenceSubtitle}>Notify when pressure or weather shifts may be relevant.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButton,
                  profile.notificationPreferences.weatherAlerts && styles.toggleButtonActive,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => updateNotificationPreference('weatherAlerts')}
              >
                <Text style={[styles.toggleButtonText, profile.notificationPreferences.weatherAlerts && styles.toggleButtonTextActive]}>
                  {profile.notificationPreferences.weatherAlerts ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.preferenceRow}>
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceTitle}>Onboarding Completed</Text>
                <Text style={styles.preferenceSubtitle}>Marks whether the questionnaire flow has been finished.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleButton,
                  profile.onboardingCompleted && styles.toggleButtonActive,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={() => updateProfile('onboardingCompleted', !profile.onboardingCompleted)}
              >
                <Text style={[styles.toggleButtonText, profile.onboardingCompleted && styles.toggleButtonTextActive]}>
                  {profile.onboardingCompleted ? 'Yes' : 'No'}
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]} onPress={handleSaveAccount}>
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#ffffff" />
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.cancelButton, styles.accountSecondaryButton, pressed && styles.cancelButtonPressed]} onPress={handleResetAccount}>
            <MaterialCommunityIcons name="refresh" size={18} color="#7f011f" />
            <Text style={styles.cancelButtonText}>Reset Details</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]} onPress={handleDeleteAccount}>
            <MaterialCommunityIcons name="delete-outline" size={18} color="#ffffff" />
            <Text style={styles.dangerButtonText}>Delete Account Permanently</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
function SectionHeader({ icon, title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrapper}>
        <MaterialCommunityIcons name={icon} size={22} color="#7f011f" />
      </View>
      <View style={styles.sectionHeaderCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable style={({ pressed }) => [styles.sectionHeaderAction, pressed && styles.addButtonPressed]} onPress={onAction}>
          <Text style={styles.sectionHeaderActionText}>{actionLabel}</Text>
          <MaterialCommunityIcons name="arrow-right" size={15} color="#ffffff" />
        </Pressable>
      ) : null}
    </View>
  );
}

function PressableCard({ icon, title, subtitle, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="#7f011f" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#d0d0d0" />
    </Pressable>
  );
}

function FormGroup({ label, children, required }) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

function InsightCard({ icon, title, value, subtitle, color }) {
  return (
    <View style={styles.insightCard}>
      <View style={[styles.insightIcon, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={[styles.insightValue, { color }]}>{value}</Text>
        <Text style={styles.insightSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={22} color="#7f011f" />
      <Text style={styles.menuLabel}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#d0d0d0" style={{ marginLeft: 'auto' }} />
    </Pressable>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons name={icon} size={48} color="#d0d0d0" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

// Stack Screens
function HomeStackScreen({ route }) {
  const onboardingState = route.params?.onboardingState || DEFAULT_ONBOARDING_STATE;
  const showPostSignupWelcome = Boolean(route.params?.showPostSignupWelcome);
  const [cycleData, setCycleData] = useState(() => createInitialCycleData());
  const [cycleHistory, setCycleHistory] = useState(() => createInitialCycleHistory());
  const [phaseOverrides, setPhaseOverrides] = useState({});

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {(props) => (
          <HomeScreen
            {...props}
            cycleData={cycleData}
            setCycleData={setCycleData}
            phaseOverrides={phaseOverrides}
            setPhaseOverrides={setPhaseOverrides}
            onboardingState={onboardingState}
            showPostSignupWelcome={showPostSignupWelcome}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CycleTracker">
        {(props) => (
          <CycleTrackerScreen
            {...props}
            cycleData={cycleData}
            setCycleData={setCycleData}
            cycleHistory={cycleHistory}
            setCycleHistory={setCycleHistory}
            phaseOverrides={phaseOverrides}
            setPhaseOverrides={setPhaseOverrides}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="EducationalContent" component={EducationalContentScreen} />
      <Stack.Screen name="EducationalArticle" component={EducationalArticleScreen} />
    </Stack.Navigator>
  );
}

function RecordsStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecordsMain" component={RecordsScreen} />
    </Stack.Navigator>
  );
}

function LogAttackStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LogAttackMain" component={LogAttackScreen} />
    </Stack.Navigator>
  );
}

function InsightsStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InsightsMain" component={InsightsScreen} />
      <Stack.Screen name="ReportPreview" component={ReportPreviewScreen} />
    </Stack.Navigator>
  );
}

function MoreStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMain" component={MoreScreen} />
      <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
      <Stack.Screen name="ManageAccount" component={ManageAccountScreen} />
      <Stack.Screen name="ManageSharingPermissions" component={ManageSharingPermissionsScreen} />
    </Stack.Navigator>
  );
}

export default function MainApp({ route }) {
  const onboardingState = route.params?.onboardingState || DEFAULT_ONBOARDING_STATE;
  const showPostSignupWelcome = Boolean(route.params?.showPostSignupWelcome);
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    'ReemKufi-Medium': require('../assets/fonts/ReemKufi-Medium.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium': require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light': require('../assets/fonts/Plein-Light.otf'),
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7f011f" />
      </SafeAreaView>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#7f011f',
        tabBarInactiveTintColor: '#d0d0d0',
        tabBarStyle: [
          styles.tabBar,
          {
            height: 70 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            HomeTab: 'home-outline',
            RecordsTab: 'calendar-blank',
            LogTab: 'flash',
            InsightsTab: 'chart-line',
            MoreTab: 'dots-horizontal',
          };
          return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreen}
        options={{ title: 'Home' }}
        initialParams={{ onboardingState, showPostSignupWelcome }}
      />
      <Tab.Screen name="RecordsTab" component={RecordsStackScreen} options={{ title: 'Records' }} />
      <Tab.Screen
        name="LogTab"
        component={LogAttackStackScreen}
        options={{
          title: 'Log',
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={({ pressed }) => [styles.fabButton, pressed && styles.fabButtonPressed]}
            >
              <MaterialCommunityIcons name="flash" size={28} color="#ffffff" />
            </Pressable>
          ),
        }}
      />
      <Tab.Screen name="InsightsTab" component={InsightsStackScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="MoreTab" component={MoreStackScreen} options={{ title: 'More' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContent: {
    paddingBottom: 32,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 12,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  headerCancelButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  headerCancelText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  flexField: {
    flex: 1,
  },

  // Welcome & Stats
  onboardingStatusCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#fff5f7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f2d6de',
    padding: 14,
  },
  onboardingStatusTitle: {
    fontSize: 16,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 4,
  },
  onboardingStatusSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#5b444b',
    lineHeight: 18,
  },
  completeProfileButton: {
    marginTop: 12,
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeProfileButtonPressed: {
    backgroundColor: '#ff727b',
  },
  completeProfileButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Plein-Medium',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 12,
  },
  sectionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f5e6eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderCopy: {
    flex: 1,
  },
  sectionHeaderAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7f011f',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  sectionHeaderActionText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Plein-Medium',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#888888',
  },

  // Cards
  cardsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardPressed: {
    backgroundColor: '#f0f0f0',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f0e6ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#888888',
  },

  // Tracking
  trackingSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trackingTitle: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5e6eb',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#0d0d0d',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonPressed: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  medicationAddButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 11,
    shadowColor: '#7f011f',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  medicationAddButtonPressed: {
    backgroundColor: '#a41b3b',
  },
  medicationAddButtonText: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#ffffff',
  },
  accountCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ececec',
    padding: 14,
    marginBottom: 14,
  },
  accountSectionTitle: {
    fontSize: 15,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 2,
  },
  accountSectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#888888',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#888888',
    marginTop: 2,
  },
  homeCycleCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#7f011f',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  homeCycleMainPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  homeCycleCardPressed: {
    opacity: 0.85,
  },
  homeCycleEmojiWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#faf2f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeCycleEmoji: {
    fontSize: 32,
  },
  homeCycleCopy: {
    flex: 1,
    alignItems: 'flex-start',
  },
  homeCyclePhase: {
    fontSize: 16,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 4,
  },
  homeCycleDay: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  perimenstrualBadge: {
    borderRadius: 999,
    backgroundColor: '#fff1f3',
    borderWidth: 1,
    borderColor: '#f4c9d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },
  perimenstrualBadgeText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#b83250',
  },
  homeCycleLink: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#8a7a80',
  },
  homeCycleQuickEditWrap: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f2ecef',
    paddingTop: 10,
  },
  homeCycleQuickEditButton: {
    alignSelf: 'stretch',
    borderRadius: 999,
    backgroundColor: '#7f011f',
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  homeCycleQuickEditButtonText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#ffffff',
  },
  homeCyclePhaseChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  homeCycleQuickEditHint: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#8a7a80',
  },
  setupCycleButton: {
    borderRadius: 10,
    backgroundColor: '#7f011f',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
  },
  setupCycleButtonText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#ffffff',
  },
  medicationCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ececec',
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
  medicationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medicationName: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  medicationMeta: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  medicationDetails: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#555555',
  },
  medicationLogPreview: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#888888',
    marginTop: 2,
  },
  medicationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  smallGhostButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  smallGhostButtonText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#444444',
  },
  sectionEditButton: {
    marginLeft: 'auto',
  },
  smallPrimaryButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#7f011f',
  },
  smallPrimaryButtonPressed: {
    backgroundColor: '#ff727b',
  },
  smallPrimaryButtonText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#ffffff',
  },
  optionChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
    marginLeft: 0,
    marginRight: 0,
  },
  optionChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  optionChipActive: {
    backgroundColor: '#7f011f',
    borderColor: '#7f011f',
  },
  optionChipText: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#555555',
  },
  optionChipTextActive: {
    color: '#ffffff',
  },
  inlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#0d0d0d',
  },
  inlineAddButton: {
    backgroundColor: '#7f011f',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  inlineAddButtonText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#ffffff',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
  },
  preferenceCopy: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 2,
  },
  preferenceSubtitle: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#888888',
  },
  addFormCard: {
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    padding: 12,
    gap: 10,
  },
  addFormTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  addFormInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#0d0d0d',
  },
  addFormDetailsInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  addFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 2,
  },
  addFormCancel: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  addFormCancelPressed: {
    backgroundColor: '#f2f2f2',
  },
  addFormCancelText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#666666',
  },
  addFormSave: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#7f011f',
  },
  addFormSavePressed: {
    backgroundColor: '#ff727b',
  },
  addFormSaveText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#ffffff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#0d0d0d',
  },
  toggleButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  toggleButtonActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  toggleButtonText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#666666',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  binaryButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  binaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  binaryButtonActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  binaryButtonText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#666666',
  },
  binaryButtonTextActive: {
    color: '#ffffff',
  },
  medicationFieldLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  effectivenessRow: {
    flexDirection: 'row',
    gap: 6,
  },
  effectivenessButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  effectivenessButtonActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  effectivenessButtonText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#666666',
  },
  effectivenessButtonTextActive: {
    color: '#ffffff',
  },

  detailHeader: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  detailHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailHeaderSpacer: {
    flex: 1,
  },
  detailScreenTitle: {
    marginTop: 16,
    fontSize: 26,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
  },
  detailScreenSubtitle: {
    fontSize: 13,
    fontFamily: 'Plein-Light',
    color: '#777777',
  },
  detailCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0ecef',
    shadowColor: '#7f011f',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 4,
  },
  detailSectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#7f7f7f',
    marginBottom: 12,
    lineHeight: 18,
  },
  phaseSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  glanceSummaryWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 6,
  },
  glancePhaseSwatch: {
    width: 18,
    height: 64,
    borderRadius: 999,
  },
  phaseSummaryEmoji: {
    fontSize: 40,
  },
  phaseSummaryCopy: {
    flex: 1,
  },
  phaseSummaryTitle: {
    fontSize: 18,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 4,
  },
  phaseSummaryText: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  emptyCycleState: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyCycleTitle: {
    marginTop: 8,
    fontSize: 17,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  emptyCycleSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'Plein-Light',
    color: '#7a7a7a',
    textAlign: 'center',
    lineHeight: 19,
  },
  inlineFieldLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 7,
    marginTop: 8,
  },
  cycleInputGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  cycleInputColumn: {
    flex: 1,
  },
  previewInfoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  previewInfoChip: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#faf7f8',
    borderWidth: 1,
    borderColor: '#f0ecef',
    padding: 10,
  },
  previewInfoLabel: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#7f7f7f',
    marginBottom: 4,
  },
  previewInfoValue: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  calendarMonthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarNavButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eadfe4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  calendarWeekHeader: {
    flexDirection: 'row',
    marginHorizontal: -3,
    marginBottom: 8,
  },
  calendarColumn: {
    width: '14.2857%',
    paddingHorizontal: 3,
  },
  calendarWeekdayCell: {
    paddingBottom: 3,
  },
  calendarSurface: {
    borderRadius: 16,
    backgroundColor: '#faf7f8',
    borderWidth: 1,
    borderColor: '#f0ecef',
    padding: 12,
  },
  calendarWeekdayText: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#8a8a8a',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
    marginVertical: -3,
  },
  calendarDayColumn: {
    aspectRatio: 0.92,
    paddingVertical: 3,
  },
  calendarEmptyCell: {
    flex: 1,
  },
  calendarDayCell: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1eaee',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  calendarDaySelected: {
    borderWidth: 2,
    borderColor: '#7f011f',
    backgroundColor: '#fff7f9',
  },
  calendarToday: {
    borderColor: '#d7b7c1',
  },
  calendarDayPressed: {
    opacity: 0.75,
  },
  calendarDayText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  calendarDayTextSelected: {
    color: '#7f011f',
  },
  calendarIndicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 8,
  },
  calendarPhaseDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  calendarWindowMarker: {
    width: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#d94764',
  },
  calendarPhaseUnderline: {
    width: 24,
    height: 3,
    borderRadius: 999,
  },
  selectedDatePanel: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#faf7f8',
    padding: 12,
  },
  selectedDateTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 4,
  },
  selectedDateSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#666666',
    marginBottom: 10,
  },
  phaseChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  phaseAssignChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd5d9',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseAssignChipDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  phaseAssignChipText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#5f5f5f',
  },
  phaseAssignChipTextActive: {
    color: '#ffffff',
  },
  cycleTimelineWrap: {
    marginTop: 2,
    marginBottom: 12,
  },
  cycleTimelineTrack: {
    height: 18,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: '#f4f0f2',
  },
  cycleTimelineSegment: {
    height: '100%',
  },
  cycleTodayMarker: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    width: 4,
    marginLeft: -2,
    borderRadius: 999,
    backgroundColor: '#0d0d0d',
  },
  timelineCurrentDayLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#555555',
  },
  cycleLegendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#555555',
  },
  perimenstrualExplanationBox: {
    marginTop: 14,
    backgroundColor: '#faf7f8',
    borderRadius: 12,
    padding: 12,
  },
  perimenstrualExplanationTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
    marginBottom: 4,
  },
  perimenstrualExplanationText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#666666',
    lineHeight: 18,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  historyTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  historySubtitle: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#888888',
    marginTop: 2,
  },
  historyLength: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },

  // Form
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 8,
  },
  binaryButtonText: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#666666',
  },
  required: {
    color: '#ff727b',
  },
  sliderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  intensityButton: {
    width: '18%',
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    padding: 0,
  },
  intensityButtonActive: {
    backgroundColor: '#7f011f',
    borderColor: '#7f011f',
  },
  intensityText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    padding: 0,
    margin: 0,
  },
  intensityTextActive: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Plein-Regular',
    color: '#0d0d0d',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonPressed: {
    backgroundColor: '#ff727b',
  },
  submitButtonHalf: {
    flex: 1,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Plein-Medium',
  },
  formActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d7c7ce',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cancelButtonPressed: {
    backgroundColor: '#f8f2f5',
  },
  cancelButtonText: {
    color: '#7f011f',
    fontSize: 15,
    fontFamily: 'Plein-Medium',
  },
  accountSecondaryButton: {
    marginTop: 10,
  },
  dangerButton: {
    marginTop: 10,
    backgroundColor: '#b91c3a',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dangerButtonPressed: {
    backgroundColor: '#d94764',
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Plein-Medium',
  },
  summaryCard: {
    marginTop: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    padding: 12,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 2,
  },
  summaryRow: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#333333',
  },
  summaryLabel: {
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  // Insights
  insightsHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  insightsTitle: {
    fontSize: 28,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
  },
  insightsSubtitle: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#666666',
    marginTop: 2,
  },
  insightsDateRange: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#8b5fbf',
  },
  rangeToggleRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  rangeToggleChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e7dee2',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rangeToggleChipActive: {
    backgroundColor: '#7f011f',
    borderColor: '#7f011f',
  },
  rangeToggleChipText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#6b5a61',
  },
  rangeToggleChipTextActive: {
    color: '#ffffff',
  },
  summaryStatsRow: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 10,
  },
  summaryStatCard: {
    width: 138,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0ecef',
    padding: 12,
    shadowColor: '#7f011f',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  summaryStatLabel: {
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#7f7f7f',
    marginBottom: 6,
  },
  summaryStatValue: {
    fontSize: 20,
    fontFamily: 'ReemKufi-Medium',
    color: '#0d0d0d',
  },
  insightsCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0ecef',
    padding: 16,
    shadowColor: '#7f011f',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  insightsPrimaryCard: {
    borderColor: '#dbc4f7',
    backgroundColor: '#fcf9ff',
  },
  insightsCardTitle: {
    fontSize: 16,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 6,
  },
  insightsCardSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#777777',
    marginBottom: 10,
  },
  primaryInsightText: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
    marginBottom: 14,
    lineHeight: 20,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  analysisLabel: {
    width: 100,
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#4d4d4d',
  },
  analysisBarTrack: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#f2edf0',
    overflow: 'hidden',
  },
  analysisBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  analysisValue: {
    width: 98,
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#666666',
  },
  insightNote: {
    marginTop: 14,
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#584952',
    lineHeight: 19,
    backgroundColor: '#faf7f8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  insightBody: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#4e4e4e',
    lineHeight: 19,
  },
  medicationInsightRow: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  medicationInsightName: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  medicationInsightStars: {
    fontSize: 13,
    color: '#f4a261',
    marginTop: 2,
  },
  medicationInsightText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#666666',
    marginTop: 4,
  },
  activityInsightCard: {
    marginTop: 2,
  },
  activityCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 10,
  },
  activityMonthControlWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f4f6',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#efe6ea',
  },
  activityMonthArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4d7dd',
  },
  activityMonthArrowText: {
    fontSize: 15,
    color: '#7f011f',
    fontFamily: 'Plein-Medium',
    lineHeight: 17,
  },
  activityMonthLabel: {
    minWidth: 84,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#4d3e45',
  },
  activityCalendarHeader: {
    flexDirection: 'row',
    marginTop: 2,
    marginBottom: 10,
  },
  activityCalendarColumn: {
    flex: 1,
    paddingHorizontal: 3,
  },
  activityCalendarDayLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#8a8a8a',
  },
  activityCalendarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  activityCalendarCell: {
    width: '100%',
    height: 28,
    borderRadius: 7,
    backgroundColor: '#f3edf0',
  },
  activityCalendarCellMid: {
    backgroundColor: '#e2c4ce',
  },
  activityCalendarCellHigh: {
    backgroundColor: '#b85a76',
  },
  activityLegendRow: {
    marginTop: 12,
    width: '100%',
  },
  activityLegendScale: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    padding: 6,
    gap: 4,
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee3e8',
  },
  activityLegendStep: {
    minWidth: 0,
    height: 16,
    borderRadius: 999,
  },
  activityLegendStepFill: {
    flex: 1,
  },
  activityLegendStepLow: {
    backgroundColor: '#f3edf0',
  },
  activityLegendStepMid: {
    backgroundColor: '#e2c4ce',
  },
  activityLegendStepHigh: {
    backgroundColor: '#b85a76',
  },
  activityLegendText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#6b6065',
  },
  activityLegendLabelsRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationBullet: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#555555',
    lineHeight: 19,
    marginTop: 6,
  },
  generateReportButton: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 30,
    backgroundColor: '#7f011f',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  generateReportButtonPressed: {
    backgroundColor: '#ff727b',
  },
  generateReportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Plein-Medium',
  },
  reportPreviewWrap: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 14,
  },
  reportPreviewTitle: {
    fontSize: 24,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
  },
  reportPreviewText: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#5a5a5a',
    lineHeight: 20,
  },
  insightCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  insightIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 16,
    fontFamily: 'ReemKufi-Medium',
    marginBottom: 2,
  },
  insightSubtitle: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#888888',
  },

  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuItemPressed: {
    backgroundColor: '#f0f0f0',
  },
  menuLabel: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#0d0d0d',
  },
  homeEducationCarouselRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  homeEducationCarouselCard: {
    width: 255,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ece6ea',
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 6,
  },
  homeEducationCarouselCategory: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#8a6170',
  },
  homeEducationCarouselTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#221c1f',
    lineHeight: 18,
  },
  homeEducationCarouselSubtitle: {
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#706368',
    lineHeight: 16,
  },
  homeEducationCarouselMeta: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#83767c',
  },
  educationSummaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ede3e7',
    backgroundColor: '#fff9fb',
    padding: 12,
    marginBottom: 12,
  },
  educationSummaryTitle: {
    fontSize: 14,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 4,
  },
  educationSummaryText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#5b5055',
    lineHeight: 18,
  },
  educationCategoryRow: {
    gap: 8,
    paddingBottom: 6,
  },
  educationCategoryChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd4d9',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  educationCategoryChipActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  educationCategoryChipText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#5f5359',
  },
  educationCategoryChipTextActive: {
    color: '#ffffff',
  },
  educationArticleList: {
    marginTop: 10,
    gap: 10,
  },
  educationArticleCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ece6ea',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  educationArticleCardSelected: {
    borderColor: '#d98ea4',
    backgroundColor: '#fff7fa',
  },
  educationArticleTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  educationArticleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f5e6eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  educationArticleCopy: {
    flex: 1,
  },
  educationArticleCategory: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#8a6170',
    marginBottom: 2,
  },
  educationArticleTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#221c1f',
    marginBottom: 3,
  },
  educationArticleSubtitle: {
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#706368',
    lineHeight: 16,
  },
  educationArticleMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  educationArticleMeta: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#83767c',
  },
  educationDetailCard: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ece6ea',
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 8,
  },
  educationDetailTitle: {
    fontSize: 16,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
  },
  educationDetailTakeaway: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#5d4851',
    lineHeight: 18,
  },
  educationDetailSection: {
    marginTop: 4,
  },
  educationDetailSectionTitle: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#372d31',
    marginBottom: 3,
  },
  educationDetailSectionText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#60535a',
    lineHeight: 18,
  },
  educationTipsList: {
    marginTop: 2,
    gap: 6,
  },
  educationTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  educationTipDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#7f011f',
    marginTop: 6,
  },
  educationTipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#5f5359',
    lineHeight: 18,
  },
  notificationsSectionHeader: {
    fontSize: 14,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 8,
  },
  notificationsSectionDisabled: {
    opacity: 0.55,
  },
  notificationsItemCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ece5e8',
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 10,
  },
  notificationsItemTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#1f1a1c',
    marginRight: 10,
  },
  notificationsExpandedBlock: {
    marginTop: 10,
    gap: 8,
  },
  notificationsPickerTrigger: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8dfe3',
    backgroundColor: '#fff9fb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  notificationsPickerLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#5f5459',
  },
  notificationsPickerValue: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  notificationsOptionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  notificationsOptionChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd4d9',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  notificationsOptionChipActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  notificationsOptionChipText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#5d5157',
  },
  notificationsOptionChipTextActive: {
    color: '#ffffff',
  },
  notificationsDisabledCard: {
    backgroundColor: '#f2eef0',
    borderColor: '#e3dde0',
  },
  sharingCodeBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eadde2',
    backgroundColor: '#fff9fb',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sharingCodeText: {
    fontSize: 30,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    letterSpacing: 1.5,
  },
  sharingCodeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sharingCodeActionButton: {
    flex: 1,
  },
  sharingCodeNote: {
    marginTop: 8,
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#887b81',
  },
  sharingTrustedList: {
    gap: 10,
  },
  sharingTrustedCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ece5e8',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  sharingTrustedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  sharingTrustedCopy: {
    flex: 1,
  },
  sharingTrustedName: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#1f1a1c',
  },
  sharingTrustedEmail: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#6f6368',
    marginTop: 2,
  },
  sharingStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  sharingStatusBadgeActive: {
    backgroundColor: '#eaf8ef',
    borderColor: '#cbeed7',
  },
  sharingStatusBadgeInactive: {
    backgroundColor: '#fff1f3',
    borderColor: '#f7ccd4',
  },
  sharingStatusBadgeText: {
    fontSize: 10,
    fontFamily: 'Plein-Medium',
  },
  sharingStatusBadgeTextActive: {
    color: '#2b8a4b',
  },
  sharingStatusBadgeTextInactive: {
    color: '#c03a55',
  },
  sharingTrustedAccess: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#51454b',
  },
  sharingTrustedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  sharingDangerGhostButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0c8d0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff4f6',
  },
  sharingDangerGhostButtonText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#b9324e',
  },
  sharingEmptyState: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0ecef',
    backgroundColor: '#fcfbfc',
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  sharingEmptyStateTitle: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#4a4145',
  },
  sharingEmptyStateSubtitle: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#8c8186',
    textAlign: 'center',
  },
  sharingPrivacyCard: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebe6e9',
    backgroundColor: '#fdfcfd',
    padding: 12,
    gap: 6,
  },
  sharingPrivacyText: {
    fontSize: 11,
    fontFamily: 'Plein-Light',
    color: '#70646a',
    lineHeight: 17,
  },
  sharingAccessLevelList: {
    gap: 8,
  },
  sharingAccessLevelCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfd5d9',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  sharingAccessLevelCardActive: {
    backgroundColor: '#fff4f7',
    borderColor: '#d88ca2',
  },
  sharingAccessLevelTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#3e3439',
    marginBottom: 2,
  },
  sharingAccessLevelTitleActive: {
    color: '#7f011f',
  },
  sharingAccessLevelDescription: {
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#7d7076',
    lineHeight: 16,
  },
  sharingAccessLevelDescriptionActive: {
    color: '#65424d',
  },
  sharingPermissionList: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ebe5e8',
    backgroundColor: '#fcfafb',
    padding: 8,
    gap: 4,
  },
  sharingPermissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  sharingPermissionLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#4b4046',
  },

  // Records
  recordsScreenContent: {
    paddingBottom: 36,
  },
  recordsHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  recordsTitle: {
    fontSize: 24,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
  },
  recordsSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#777777',
    marginTop: 2,
  },
  recordsViewToggleRow: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: '#f8f2f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0e4e9',
    padding: 6,
    gap: 10,
  },
  recordsViewToggle: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  recordsViewToggleActive: {
    backgroundColor: '#7f011f',
  },
  recordsViewToggleText: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#6e6166',
  },
  recordsViewToggleTextActive: {
    color: '#ffffff',
  },
  recordsCalendarCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0ecef',
    padding: 14,
    shadowColor: '#7f011f',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    minHeight: 320,
  },
  recordsCalendarStatsCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0ecef',
    padding: 16,
    shadowColor: '#7f011f',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  recordsCalendarStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordsCalendarStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordsCalendarStatValue: {
    fontSize: 18,
    fontFamily: 'Plein-Bold',
    color: '#0d0d0d',
  },
  recordsCalendarStatLabel: {
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#757575',
  },
  recordsCalendarStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#ebe4e7',
    marginHorizontal: 6,
  },
  recordsCalendarLegendCard: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#fdfbfc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f7f1f4',
    padding: 14,
  },
  recordsCalendarLegendTitle: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
    marginBottom: 10,
  },
  recordsCalendarLegendRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 8,
  },
  recordsCalendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordsCalendarLegendSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordsCalendarLegendText: {
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#655a5f',
  },
  recordsCalendarLegendHint: {
    fontSize: 10,
    fontFamily: 'Plein-Regular',
    color: '#a1929a',
    fontStyle: 'italic',
  },
  recordsCalendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recordsCalendarNavButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e7d9df',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordsCalendarMonthLabel: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#3f3238',
  },
  recordsCalendarWeekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recordsCalendarWeekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  recordsCalendarColumn: {
    flex: 1,
    paddingHorizontal: 2,
  },
  recordsCalendarWeekLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#8f8188',
  },
  recordsCalendarEmptyCell: {
    width: '100%',
    height: 38,
  },
  recordsCalendarDayCell: {
    width: '100%',
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0edf0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  recordsCalendarDayCellToday: {
    borderColor: '#7f011f',
  },
  recordsCalendarDayCellSelected: {
    backgroundColor: '#fdf5f8',
    borderColor: '#db93ab',
  },
  recordsCalendarDayCellPressed: {
    backgroundColor: '#f8eff3',
  },
  recordsCalendarDayText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#464046',
  },
  recordsCalendarDayTextToday: {
    color: '#7f011f',
  },
  recordsCalendarDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#7f011f',
  },
  recordsStatsBar: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ebe4e7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#7f011f',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  recordsStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  recordsStatsTitle: {
    fontSize: 14,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  recordsStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  recordsStatBox: {
    flex: 1,
    backgroundColor: '#faf6f8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3eaee',
  },
  recordsStatValue: {
    fontSize: 18,
    fontFamily: 'Plein-Bold',
    color: '#0d0d0d',
    marginBottom: 2,
  },
  recordsStatLabel: {
    fontSize: 10,
    fontFamily: 'Plein-Regular',
    color: '#7a6f75',
    textAlign: 'center',
  },
  recordsFilterRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  recordsFilterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ded1d7',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recordsFilterChipActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  recordsFilterChipText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#675a60',
  },
  recordsFilterChipTextActive: {
    color: '#ffffff',
  },
  recordsSelectedFilterBar: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: '#fff6fa',
    borderWidth: 1,
    borderColor: '#f0dce4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordsSelectedFilterText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#694f58',
  },
  recordsSelectedFilterClear: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  recordsListWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 12,
  },
  recordLogCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0ecef',
    padding: 12,
    shadowColor: '#7f011f',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recordLogHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  recordLogDateTime: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#1d1d1d',
  },
  recordLogActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordActionButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ede3e8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  recordSeverityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recordSeverityLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#6a6165',
    width: 52,
  },
  recordSeverityTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#f2ebee',
    overflow: 'hidden',
  },
  recordSeverityFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#7f011f',
  },
  recordSeverityValue: {
    width: 38,
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
    textAlign: 'right',
  },
  recordDetailText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#555555',
    lineHeight: 18,
    marginTop: 2,
  },
  recordsListEmpty: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0ecef',
    backgroundColor: '#ffffff',
    paddingVertical: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  recordsModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 8, 11, 0.45)',
    justifyContent: 'flex-end',
  },
  recordsModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    maxHeight: '86%',
  },
  recordsModalTitle: {
    fontSize: 18,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 10,
  },
  recordsModalContent: {
    paddingBottom: 8,
    gap: 10,
  },
  recordsModalLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#4f4449',
    marginBottom: -2,
  },
  recordsPhaseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recordsPhaseChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd1d7',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  recordsPhaseChipActive: {
    backgroundColor: '#7f011f',
    borderColor: '#7f011f',
  },
  recordsPhaseChipText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#675a60',
  },
  recordsPhaseChipTextActive: {
    color: '#ffffff',
  },
  recordsModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  // Empty State
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'ReemKufi-Medium',
    color: '#0d0d0d',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Plein-Light',
    color: '#888888',
  },

  // Bottom Tab
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopColor: '#f0f0f0',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: 'Plein-Light',
    fontSize: 11,
    marginTop: 4,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7f011f',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#7f011f',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fabButtonPressed: {
    backgroundColor: '#ff727b',
  },
});
