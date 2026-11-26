// src/constants/dummyData.js
//
// All mock data for the MainApp lives here.
// When you wire up the backend, you'll replace these exports with API calls.
// Keeping them in one file makes them easy to find and remove later.

import { addDays, toDateInputValue } from '../utils/dateUtils';

// ─────────────────────────────────────────────────────
// User Profile
// ─────────────────────────────────────────────────────

export const DUMMY_USER = {
  id: 'user-001',
  fullName: 'Ava Thompson',
  preferredName: 'Ava',
  email: 'ava@example.com',
  menstrualStatus: 'regular',
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

// ─────────────────────────────────────────────────────
// Cycle Data
// ─────────────────────────────────────────────────────

export function createInitialCycleData() {
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

export function createInitialCycleHistory() {
  const latest = createInitialCycleData();
  const latestStart = new Date(latest.lastPeriodStartDate);

  return [
    {
      id: 'cycle-current',
      periodStart: latest.lastPeriodStartDate,
      periodEnd: latest.lastPeriodEndDate,
      cycleLength: 28,
      ovulationDay: 14,
      notes: 'Current mock cycle',
    },
    {
      id: 'cycle-previous-1',
      periodStart: toDateInputValue(addDays(latestStart, -28)),
      periodEnd: toDateInputValue(addDays(latestStart, -24)),
      cycleLength: 28,
      ovulationDay: 14,
      notes: 'Steady mock cycle',
    },
    {
      id: 'cycle-previous-2',
      periodStart: toDateInputValue(addDays(latestStart, -56)),
      periodEnd: toDateInputValue(addDays(latestStart, -52)),
      cycleLength: 27,
      ovulationDay: 13,
      notes: 'Slightly shorter cycle',
    },
  ];
}

// ─────────────────────────────────────────────────────
// Migraine Logs
// ─────────────────────────────────────────────────────
//
// Each entry is offset by `dayOffset` days from today.
// The `createInitialMigraineLogs()` function resolves the offset
// into a real ISO date when the app starts.

const MIGRAINE_LOG_TEMPLATES = [
  { id: 'log-001', dayOffset: 1,  hour: 21, minute: 30, intensity: 8, durationHours: 4.5, symptoms: ['Nausea', 'Photophobia', 'Aura'], cyclePhaseKey: 'luteal',    cycleDay: 24, auraPresent: true,  triggers: ['Stress', 'Hormonal'],            medications: ['Sumatriptan'],         notes: 'Evening attack after a stressful day.' },
  { id: 'log-002', dayOffset: 3,  hour: 10, minute: 0,  intensity: 7, durationHours: 3.5, symptoms: ['Photophobia', 'Fatigue'],              cyclePhaseKey: 'luteal',    cycleDay: 22, auraPresent: false, triggers: ['Sleep Deprivation'],             medications: ['Ibuprofen'],           notes: 'Started mid-morning and improved with rest.' },
  { id: 'log-003', dayOffset: 6,  hour: 14, minute: 15, intensity: 6, durationHours: 2.5, symptoms: ['Dizziness', 'Nausea'],                 cyclePhaseKey: 'ovulatory', cycleDay: 15, auraPresent: false, triggers: ['Weather Change'],                medications: ['Naproxen'],            notes: 'Mild dizziness with pressure drop.' },
  { id: 'log-004', dayOffset: 8,  hour: 7,  minute: 40, intensity: 9, durationHours: 6,   symptoms: ['Aura', 'Photophobia', 'Phonophobia'],  cyclePhaseKey: 'menstrual', cycleDay: 2,  auraPresent: true,  triggers: ['Hormonal', 'Sleep Deprivation'], medications: ['Sumatriptan', 'Ibuprofen'], notes: 'Strong morning onset during period.' },
  { id: 'log-005', dayOffset: 11, hour: 18, minute: 20, intensity: 5, durationHours: 2,   symptoms: ['Fatigue'],                              cyclePhaseKey: 'follicular', cycleDay: 8,  auraPresent: false, triggers: ['Stress'],                        medications: ['Hydration + rest'],    notes: 'Short episode after long meeting.' },
  { id: 'log-006', dayOffset: 14, hour: 12, minute: 5,  intensity: 7, durationHours: 4,   symptoms: ['Nausea', 'Photophobia'],                cyclePhaseKey: 'luteal',    cycleDay: 20, auraPresent: false, triggers: ['Hormonal', 'Weather Change'],    medications: ['Sumatriptan'],         notes: 'Typical pre-period pattern.' },
  { id: 'log-007', dayOffset: 17, hour: 9,  minute: 30, intensity: 4, durationHours: 1.5, symptoms: ['Fatigue'],                              cyclePhaseKey: 'follicular', cycleDay: 10, auraPresent: false, triggers: ['Skipped meal'],                  medications: ['Snack + water'],       notes: 'Resolved quickly after meal.' },
  { id: 'log-008', dayOffset: 20, hour: 22, minute: 10, intensity: 8, durationHours: 5,   symptoms: ['Aura', 'Nausea'],                       cyclePhaseKey: 'menstrual', cycleDay: 1,  auraPresent: true,  triggers: ['Hormonal', 'Stress'],            medications: ['Sumatriptan'],         notes: 'First day of period with aura.' },
  { id: 'log-009', dayOffset: 24, hour: 16, minute: 55, intensity: 6, durationHours: 3,   symptoms: ['Photophobia'],                          cyclePhaseKey: 'ovulatory', cycleDay: 14, auraPresent: false, triggers: ['Screen time'],                   medications: ['Naproxen'],            notes: 'Likely triggered by extended laptop use.' },
  { id: 'log-010', dayOffset: 28, hour: 11, minute: 45, intensity: 7, durationHours: 4.2, symptoms: ['Nausea', 'Fatigue'],                    cyclePhaseKey: 'luteal',    cycleDay: 23, auraPresent: false, triggers: ['Stress', 'Sleep Deprivation'],   medications: ['Sumatriptan'],         notes: 'Recovered after hydration and quiet room.' },
  { id: 'log-011', dayOffset: 33, hour: 6,  minute: 50, intensity: 8, durationHours: 5.5, symptoms: ['Aura', 'Photophobia', 'Phonophobia'],  cyclePhaseKey: 'menstrual', cycleDay: 3,  auraPresent: true,  triggers: ['Hormonal'],                      medications: ['Sumatriptan'],         notes: 'Severe early-morning migraine.' },
  { id: 'log-012', dayOffset: 38, hour: 13, minute: 25, intensity: 5, durationHours: 2.3, symptoms: ['Dizziness'],                            cyclePhaseKey: 'follicular', cycleDay: 9,  auraPresent: false, triggers: ['Weather Change'],                medications: ['Ibuprofen'],           notes: 'Pressure shift day.' },
  { id: 'log-013', dayOffset: 43, hour: 19, minute: 35, intensity: 7, durationHours: 3.8, symptoms: ['Nausea', 'Photophobia'],                cyclePhaseKey: 'luteal',    cycleDay: 21, auraPresent: false, triggers: ['Stress', 'Late caffeine'],       medications: ['Naproxen'],            notes: 'Started after late coffee.' },
  { id: 'log-014', dayOffset: 49, hour: 15, minute: 10, intensity: 6, durationHours: 3.1, symptoms: ['Fatigue', 'Photophobia'],               cyclePhaseKey: 'ovulatory', cycleDay: 13, auraPresent: false, triggers: ['Skipped water'],                 medications: ['Hydration + rest'],    notes: 'Moderate afternoon episode.' },
];

export function createInitialMigraineLogs() {
  const now = new Date();
  return MIGRAINE_LOG_TEMPLATES.map((entry) => {
    const loggedDate = new Date(now);
    loggedDate.setDate(now.getDate() - entry.dayOffset);
    loggedDate.setHours(entry.hour, entry.minute, 0, 0);
    return {
      ...entry,
      dateTime: loggedDate.toISOString(),
    };
  });
}

// ─────────────────────────────────────────────────────
// Medications
// ─────────────────────────────────────────────────────

export function createInitialMedications() {
  return [
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
    {
      id: 'med-2',
      name: 'Sumatriptan',
      dosage: '50mg',
      frequency: 'As needed (acute)',
      startDate: '2026-05-15',
      endDate: '',
      reminderEnabled: false,
      reminderTime: '08:00',
      intakeLogs: [],
    },
  ];
}

// ─────────────────────────────────────────────────────
// Trusted Persons / Sharing
// ─────────────────────────────────────────────────────

export const SHARING_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const SHARING_DEFAULT_CODE = 'X7K-9P2-LM4';

export const SHARING_ACCESS_LEVELS = [
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

export function getPermissionsForAccessLevel(accessLevelKey) {
  const match = SHARING_ACCESS_LEVELS.find((item) => item.key === accessLevelKey);
  return match
    ? { ...match.permissions }
    : { ...SHARING_ACCESS_LEVELS[1].permissions };
}

export function createInitialTrustedPersons() {
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

// ─────────────────────────────────────────────────────
// Common Symptoms & Triggers
// ─────────────────────────────────────────────────────

export const DEFAULT_COMMON_SYMPTOMS = [
  { id: 'home-sym-1', name: 'Nausea' },
  { id: 'home-sym-2', name: 'Photophobia' },
  { id: 'home-sym-3', name: 'Fatigue' },
];

export const DEFAULT_COMMON_TRIGGERS = [
  { id: 'home-trig-1', name: 'Stress' },
  { id: 'home-trig-2', name: 'Sleep' },
  { id: 'home-trig-3', name: 'Weather' },
];

// Full picker lists for the Log Migraine screen
export const SYMPTOM_OPTIONS = [
  { id: 'sym-nausea', name: 'Nausea' },
  { id: 'sym-photophobia', name: 'Photophobia' },
  { id: 'sym-phonophobia', name: 'Phonophobia' },
  { id: 'sym-aura', name: 'Aura' },
  { id: 'sym-dizziness', name: 'Dizziness' },
  { id: 'sym-fatigue', name: 'Fatigue' },
];

export const TRIGGER_OPTIONS = [
  { id: 'trig-stress', name: 'Stress', category: 'stress' },
  { id: 'trig-sleep', name: 'Sleep', category: 'sleep' },
  { id: 'trig-weather', name: 'Weather', category: 'weather' },
  { id: 'trig-food', name: 'Food', category: 'food' },
  { id: 'trig-exercise', name: 'Exercise', category: 'other' },
];

export const MEDICATION_OPTIONS = [
  { id: 'med-ibuprofen', name: 'Ibuprofen' },
  { id: 'med-naproxen', name: 'Naproxen' },
  { id: 'med-sumatriptan', name: 'Sumatriptan' },
];

// ─────────────────────────────────────────────────────
// Education Articles
// ─────────────────────────────────────────────────────

export const EDUCATION_ARTICLES = [
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

// ─────────────────────────────────────────────────────
// Insights Data (per range)
// ─────────────────────────────────────────────────────
//
// TODO: eventually replace with real calculations from logs.
// For now this is the canned mock data from the old app.

export const INSIGHTS_BY_RANGE = {
  day: {
    dateRangeLabel: 'Today',
    summaryStats: [
      { label: 'Total Migraines', value: '1' },
      { label: 'Average Intensity', value: '6.0/10' },
      { label: 'Avg Duration', value: '3.0 hrs' },
      { label: 'Triggered by Cycle', value: '100%' },
    ],
    phaseDistribution: [
      { key: 'menstrual',  label: 'Menstrual',  value: 1, color: '#e07a9a' },
      { key: 'follicular', label: 'Follicular', value: 0, color: '#7fc8a0' },
      { key: 'ovulatory',  label: 'Ovulatory',  value: 0, color: '#f0c674' },
      { key: 'luteal',     label: 'Luteal',     value: 0, color: '#a98ee0' },
    ],
    triggerData: [
      { label: 'Stress', value: 1, color: '#ad89dc' },
      { label: 'Sleep Deprivation', value: 0, color: '#c8b0e8' },
      { label: 'Weather Change', value: 0, color: '#f0c674' },
      { label: 'Hormonal', value: 1, color: '#e07a9a' },
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
      { key: 'menstrual',  label: 'Menstrual',  value: 1, color: '#e07a9a' },
      { key: 'follicular', label: 'Follicular', value: 1, color: '#7fc8a0' },
      { key: 'ovulatory',  label: 'Ovulatory',  value: 0, color: '#f0c674' },
      { key: 'luteal',     label: 'Luteal',     value: 2, color: '#a98ee0' },
    ],
    triggerData: [
      { label: 'Stress', value: 4, color: '#ad89dc' },
      { label: 'Sleep Deprivation', value: 2, color: '#c8b0e8' },
      { label: 'Weather Change', value: 1, color: '#f0c674' },
      { label: 'Hormonal', value: 2, color: '#e07a9a' },
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
      { key: 'menstrual',  label: 'Menstrual',  value: 3, color: '#e07a9a' },
      { key: 'follicular', label: 'Follicular', value: 1, color: '#7fc8a0' },
      { key: 'ovulatory',  label: 'Ovulatory',  value: 1, color: '#f0c674' },
      { key: 'luteal',     label: 'Luteal',     value: 5, color: '#a98ee0' },
    ],
    triggerData: [
      { label: 'Stress', value: 7, color: '#ad89dc' },
      { label: 'Sleep Deprivation', value: 5, color: '#c8b0e8' },
      { label: 'Weather Change', value: 4, color: '#f0c674' },
      { label: 'Hormonal', value: 6, color: '#e07a9a' },
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
      { key: 'menstrual',  label: 'Menstrual',  value: 8,  color: '#e07a9a' },
      { key: 'follicular', label: 'Follicular', value: 2,  color: '#7fc8a0' },
      { key: 'ovulatory',  label: 'Ovulatory',  value: 3,  color: '#f0c674' },
      { key: 'luteal',     label: 'Luteal',     value: 10, color: '#a98ee0' },
    ],
    triggerData: [
      { label: 'Stress', value: 12, color: '#ad89dc' },
      { label: 'Sleep Deprivation', value: 8, color: '#c8b0e8' },
      { label: 'Weather Change', value: 6, color: '#f0c674' },
      { label: 'Hormonal', value: 9, color: '#e07a9a' },
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
      { key: 'menstrual',  label: 'Menstrual',  value: 15, color: '#e07a9a' },
      { key: 'follicular', label: 'Follicular', value: 6,  color: '#7fc8a0' },
      { key: 'ovulatory',  label: 'Ovulatory',  value: 8,  color: '#f0c674' },
      { key: 'luteal',     label: 'Luteal',     value: 25, color: '#a98ee0' },
    ],
    triggerData: [
      { label: 'Stress', value: 29, color: '#ad89dc' },
      { label: 'Sleep Deprivation', value: 20, color: '#c8b0e8' },
      { label: 'Weather Change', value: 17, color: '#f0c674' },
      { label: 'Hormonal', value: 24, color: '#e07a9a' },
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

// ─────────────────────────────────────────────────────
// Notifications Default State
// ─────────────────────────────────────────────────────

export const DEFAULT_NOTIFICATION_SETTINGS = {
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
};