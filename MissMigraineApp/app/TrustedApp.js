import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TRUSTED_PERSON_PROFILE = {
  displayName: 'Mike Johnson',
  email: 'mike@example.com',
  role: 'Trusted Person',
};

const SUPPORTED_USERS = [
  {
    id: 'sarah',
    name: 'Sarah',
    relationship: 'Partner',
    accessLevel: 'Full Access',
    status: 'Active',
    lastUpdated: 'Data updated 2 hours ago',
    permissions: {
      logs: true,
      cycle: true,
      insights: true,
      alerts: true,
    },
  },
  {
    id: 'emma',
    name: 'Emma',
    relationship: 'Sister',
    accessLevel: 'Limited Access',
    status: 'Active',
    lastUpdated: 'Data updated 6 hours ago',
    permissions: {
      logs: true,
      cycle: false,
      insights: true,
      alerts: true,
    },
  },
];

const USER_INSIGHTS = {
  sarah: {
    monthlyMigraines: 4,
    averageSeverity: '7/10',
    topTrigger: 'Stress',
    correlationDetected: true,
    correlationText: 'Sarah is 4x more likely to have a migraine 2 days before her period.',
    phaseDistribution: [
      { phase: 'Menstrual', count: 3, color: '#d94764' },
      { phase: 'Follicular', count: 1, color: '#5aa469' },
      { phase: 'Ovulatory', count: 2, color: '#f4a261' },
      { phase: 'Luteal', count: 5, color: '#8b5fbf' },
    ],
    topTriggers: [
      { name: 'Stress', count: 8 },
      { name: 'Sleep Deprivation', count: 6 },
      { name: 'Weather Change', count: 4 },
    ],
    trends: [
      { month: 'Apr', count: 7 },
      { month: 'May', count: 6 },
      { month: 'Jun', count: 5 },
      { month: 'Jul', count: 4 },
    ],
  },
  emma: {
    monthlyMigraines: 2,
    averageSeverity: '6/10',
    topTrigger: 'Sleep Deprivation',
    correlationDetected: false,
    correlationText: 'No clear cycle-migraine correlation has been detected yet.',
    phaseDistribution: [
      { phase: 'Menstrual', count: 1, color: '#d94764' },
      { phase: 'Follicular', count: 1, color: '#5aa469' },
      { phase: 'Ovulatory', count: 0, color: '#f4a261' },
      { phase: 'Luteal', count: 1, color: '#8b5fbf' },
    ],
    topTriggers: [
      { name: 'Sleep Deprivation', count: 4 },
      { name: 'Stress', count: 3 },
      { name: 'Skipped Meals', count: 2 },
    ],
    trends: [
      { month: 'Apr', count: 3 },
      { month: 'May', count: 3 },
      { month: 'Jun', count: 2 },
      { month: 'Jul', count: 2 },
    ],
  },
};

const USER_LOGS = {
  sarah: [
    {
      id: 's-log-1',
      dateTime: '2026-07-22T11:20:00.000Z',
      intensity: 8,
      durationHours: 4,
      symptoms: ['Nausea', 'Photophobia'],
      cyclePhase: 'Luteal Phase',
      cycleDay: 24,
      triggers: ['Stress'],
      medications: ['Sumatriptan'],
    },
    {
      id: 's-log-2',
      dateTime: '2026-07-20T08:10:00.000Z',
      intensity: 7,
      durationHours: 3,
      symptoms: ['Fatigue', 'Photophobia'],
      cyclePhase: 'Luteal Phase',
      cycleDay: 22,
      triggers: ['Sleep Deprivation'],
      medications: ['Ibuprofen'],
    },
    {
      id: 's-log-3',
      dateTime: '2026-07-16T19:40:00.000Z',
      intensity: 6,
      durationHours: 2.5,
      symptoms: ['Dizziness'],
      cyclePhase: 'Ovulatory Phase',
      cycleDay: 14,
      triggers: ['Weather Change'],
      medications: ['Naproxen'],
    },
    {
      id: 's-log-4',
      dateTime: '2026-07-12T06:45:00.000Z',
      intensity: 9,
      durationHours: 5.5,
      symptoms: ['Aura', 'Phonophobia'],
      cyclePhase: 'Menstrual Phase',
      cycleDay: 2,
      triggers: ['Hormonal'],
      medications: ['Sumatriptan'],
    },
    {
      id: 's-log-5',
      dateTime: '2026-07-08T13:05:00.000Z',
      intensity: 5,
      durationHours: 1.5,
      symptoms: ['Fatigue'],
      cyclePhase: 'Follicular Phase',
      cycleDay: 8,
      triggers: ['Stress'],
      medications: ['Hydration + Rest'],
    },
    {
      id: 's-log-6',
      dateTime: '2026-07-03T17:30:00.000Z',
      intensity: 7,
      durationHours: 3.8,
      symptoms: ['Nausea', 'Photophobia'],
      cyclePhase: 'Luteal Phase',
      cycleDay: 21,
      triggers: ['Late caffeine'],
      medications: ['Naproxen'],
    },
  ],
  emma: [
    {
      id: 'e-log-1',
      dateTime: '2026-07-21T09:10:00.000Z',
      intensity: 6,
      durationHours: 2.2,
      symptoms: ['Photophobia'],
      cyclePhase: 'Follicular Phase',
      cycleDay: 10,
      triggers: ['Sleep Deprivation'],
      medications: ['Ibuprofen'],
    },
    {
      id: 'e-log-2',
      dateTime: '2026-07-14T22:30:00.000Z',
      intensity: 7,
      durationHours: 3.1,
      symptoms: ['Nausea'],
      cyclePhase: 'Luteal Phase',
      cycleDay: 20,
      triggers: ['Stress'],
      medications: ['Naproxen'],
    },
    {
      id: 'e-log-3',
      dateTime: '2026-07-09T07:45:00.000Z',
      intensity: 5,
      durationHours: 1.8,
      symptoms: ['Fatigue'],
      cyclePhase: 'Menstrual Phase',
      cycleDay: 3,
      triggers: ['Skipped Meals'],
      medications: ['Rest'],
    },
  ],
};

function formatDateTimeLabel(value) {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }
  return parsedDate
    .toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    .replace(',', ' ·');
}

function getSeverityColor(value) {
  if (value >= 8) {
    return '#c81d3a';
  }
  if (value >= 6) {
    return '#e4842a';
  }
  return '#5b9c6a';
}

function getRelativeTime(isoValue) {
  const diffMs = Date.now() - new Date(isoValue).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function TrustedScreenHero({ icon, eyebrow, title, subtitle, avatarLetter = 'M' }) {
  return (
    <LinearGradient colors={['#7f011f', '#a72e4e', '#c0465f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trustedHero}>
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />
      <View style={styles.heroTopRow}>
        <View style={styles.heroAvatar}><Text style={styles.heroAvatarText}>{avatarLetter}</Text></View>
        <View style={styles.headerCopy}>
          <Text style={styles.heroEyebrow}>{eyebrow}</Text>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.heroShield}><MaterialCommunityIcons name={icon} size={23} color="#fff" /></View>
      </View>
    </LinearGradient>
  );
}

function CompactScreenHeading({ icon, eyebrow, title, subtitle }) {
  return (
    <View style={styles.compactHeading}>
      <View style={styles.compactHeadingIcon}><MaterialCommunityIcons name={icon} size={22} color="#7f011f" /></View>
      <View style={styles.headerCopy}>
        <Text style={styles.compactHeadingEyebrow}>{eyebrow}</Text>
        <Text style={styles.compactHeadingTitle}>{title}</Text>
        <Text style={styles.compactHeadingSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function TrustedHomeScreen({ navigation, selectedUser, sharedInsights, logs, activeAlert, onSelectUser }) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const recentLogs = logs.slice(0, 4);

  if (!selectedUser) {
    return (
      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="link-off" size={44} color="#c2b8be" />
          <Text style={styles.emptyTitle}>No data shared yet</Text>
          <Text style={styles.emptySubtitle}>
            You will see insights and logs here once a user shares data with you.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#7f011f', '#a72e4e', '#c0465f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trustedHero}>
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />
          <View style={styles.heroTopRow}>
            <View style={styles.heroAvatar}><Text style={styles.heroAvatarText}>{selectedUser.name.charAt(0)}</Text></View>
            <View style={styles.headerCopy}>
              <Text style={styles.heroEyebrow}>CARE CIRCLE</Text>
              <Text style={styles.heroTitle}>Hi, {TRUSTED_PERSON_PROFILE.displayName.split(' ')[0]}</Text>
              <Text style={styles.heroSubtitle}>Supporting {selectedUser.name} with care</Text>
            </View>
            <View style={styles.heroShield}><MaterialCommunityIcons name="shield-heart-outline" size={23} color="#fff" /></View>
          </View>
          <View style={styles.heroStatusRow}>
            <View style={styles.heroStatusDot} />
            <Text style={styles.heroStatusText}>{selectedUser.status} connection · {selectedUser.lastUpdated.replace('Data updated ', '')}</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          {activeAlert ? (
            <View style={[styles.emergencyCard, styles.emergencyCardHigh]}>
              <Text style={styles.emergencyTitle}>⚠️ Emergency Alert</Text>
              <Text style={styles.emergencyText}>Severity: Severe migraine ({activeAlert.intensity}/10)</Text>
              <Text style={styles.emergencyText}>Time: {getRelativeTime(activeAlert.occurredAt)}</Text>
              <Text style={styles.emergencyText}>{selectedUser.name} is having a severe migraine attack.</Text>
              <Pressable
                style={({ pressed }) => [styles.smallPrimaryButton, styles.inlineActionButton, pressed && styles.smallPrimaryButtonPressed]}
                onPress={() => navigation.getParent()?.navigate('AlertsTab')}
              >
                <Text style={styles.smallPrimaryButtonText}>View Details</Text>
              </Pressable>
            </View>
          ) : null}

          {SUPPORTED_USERS.length > 1 ? (
            <View style={styles.accountCard}>
              <Pressable
                style={({ pressed }) => [styles.switcherTrigger, pressed && styles.cardPressed]}
                onPress={() => setSwitcherOpen((prev) => !prev)}
              >
                <Text style={styles.switcherTriggerLabel}>Current user: {selectedUser.name}</Text>
                <MaterialCommunityIcons name={switcherOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#7f011f" />
              </Pressable>
              {switcherOpen && (
                <View style={styles.switcherMenu}>
                  {SUPPORTED_USERS.map((user) => (
                    <Pressable
                      key={`switch-user-${user.id}`}
                      style={({ pressed }) => [
                        styles.switcherOption,
                        user.id === selectedUser.id && styles.switcherOptionActive,
                        pressed && styles.addButtonPressed,
                      ]}
                      onPress={() => {
                        onSelectUser(user.id);
                        setSwitcherOpen(false);
                      }}
                    >
                      <Text style={[styles.switcherOptionText, user.id === selectedUser.id && styles.switcherOptionTextActive]}>
                        {user.name} · {user.relationship}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : null}

          <View style={[styles.accountCard, styles.currentUserCard]}>
            <View style={styles.cardTitleRow}><Text style={styles.accountSectionTitle}>Current User</Text><MaterialCommunityIcons name="account-heart-outline" size={20} color="#a72e4e" /></View>
            <View style={styles.currentUserTopRow}>
              <Text style={styles.supportUserName}>{selectedUser.name} · {selectedUser.relationship}</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDotActive} />
                <Text style={styles.statusPillText}>{selectedUser.status}</Text>
              </View>
            </View>
            <Text style={styles.supportUserMeta}>{selectedUser.lastUpdated}</Text>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.cardTitleRow}><Text style={styles.accountSectionTitle}>Shared Insights</Text><Text style={styles.readOnlyInline}>READ ONLY</Text></View>
            <View style={styles.insightStatsRow}>
              <View style={[styles.insightStatChip, styles.insightStatChipRose]}>
                <MaterialCommunityIcons name="calendar-month-outline" size={17} color="#a72e4e" />
                <Text style={styles.insightStatValue}>{sharedInsights.monthlyMigraines}</Text>
                <Text style={styles.insightStatLabel}>This month</Text>
              </View>
              <View style={[styles.insightStatChip, styles.insightStatChipPlum]}>
                <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={17} color="#8b4789" />
                <Text style={styles.insightStatValue}>{sharedInsights.averageSeverity}</Text>
                <Text style={styles.insightStatLabel}>Avg severity</Text>
              </View>
              <View style={[styles.insightStatChip, styles.insightStatChipGold]}>
                <MaterialCommunityIcons name="weather-windy" size={17} color="#b76b2c" />
                <Text style={styles.insightStatValue}>{sharedInsights.topTrigger}</Text>
                <Text style={styles.insightStatLabel}>Top trigger</Text>
              </View>
            </View>
            <View style={styles.correlationPill}>
              <MaterialCommunityIcons name="lightning-bolt-outline" size={14} color="#7f011f" />
              <Text style={styles.correlationPillText}>
                {sharedInsights.correlationDetected ? 'Cycle-migraine correlation detected' : 'No cycle correlation detected yet'}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.smallPrimaryButton, styles.inlineActionButton, pressed && styles.smallPrimaryButtonPressed]}
              onPress={() => navigation.navigate('TrustedFullInsights')}
            >
              <Text style={styles.smallPrimaryButtonText}>View Full Insights</Text>
            </Pressable>
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Recent Migraines</Text>
            <Text style={styles.supportUserMeta}>Latest shared logs from {selectedUser.name} (read-only)</Text>
            {recentLogs.map((log) => (
              <View key={log.id} style={styles.trustedLogCard}>
                <Text style={styles.trustedLogDate}>{formatDateTimeLabel(log.dateTime)}</Text>
                <View style={styles.trustedLogSeverityRow}>
                  <View style={styles.trustedSeverityTrack}>
                    <View style={[styles.trustedSeverityFill, { width: `${log.intensity * 10}%`, backgroundColor: getSeverityColor(log.intensity) }]} />
                  </View>
                  <Text style={[styles.trustedLogSeverityValue, { color: getSeverityColor(log.intensity) }]}>{log.intensity}/10</Text>
                </View>
                <Text style={styles.trustedLogDetail}>Duration: {log.durationHours} hours</Text>
                <Text style={styles.trustedLogDetail}>Symptoms: {log.symptoms.join(', ')}</Text>
                <Text style={styles.trustedLogDetail}>
                  {log.cyclePhase} · Day {log.cycleDay}
                </Text>
              </View>
            ))}
            <Pressable
              style={({ pressed }) => [styles.smallPrimaryButton, styles.inlineActionButton, pressed && styles.smallPrimaryButtonPressed]}
              onPress={() => navigation.navigate('TrustedFullLogs')}
            >
              <Text style={styles.smallPrimaryButtonText}>View All Logs</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrustedFullInsightsScreen({ navigation, selectedUser, sharedInsights }) {
  const phaseMax = Math.max(...sharedInsights.phaseDistribution.map((item) => item.count), 1);
  const trendDirection =
    sharedInsights.trends.length < 2
      ? 'Stable'
      : sharedInsights.trends[sharedInsights.trends.length - 1].count < sharedInsights.trends[0].count
        ? 'Decreasing'
        : sharedInsights.trends[sharedInsights.trends.length - 1].count > sharedInsights.trends[0].count
          ? 'Increasing'
          : 'Stable';

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconWrapper}>
            <MaterialCommunityIcons name="chart-line" size={22} color="#7f011f" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.sectionTitle}>Full Insights</Text>
            <Text style={styles.sectionSubtitle}>Shared insights for {selectedUser.name}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Cycle-Migraine Correlation</Text>
            <Text style={styles.supportUserMeta}>{sharedInsights.correlationText}</Text>
            {sharedInsights.phaseDistribution.map((phase) => (
              <View key={`phase-${phase.phase}`} style={styles.analysisRow}>
                <Text style={styles.analysisLabel}>{phase.phase}</Text>
                <View style={styles.analysisBarTrack}>
                  <View style={[styles.analysisBarFill, { width: `${(phase.count / phaseMax) * 100}%`, backgroundColor: phase.color }]} />
                </View>
                <Text style={styles.analysisValue}>{phase.count}</Text>
              </View>
            ))}
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Top Triggers</Text>
            {sharedInsights.topTriggers.map((trigger) => (
              <Text key={`trigger-${trigger.name}`} style={styles.supportUserMeta}>
                • {trigger.name} ({trigger.count})
              </Text>
            ))}
          </View>

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Frequency Trends</Text>
            {sharedInsights.trends.map((trend) => (
              <Text key={`trend-${trend.month}`} style={styles.supportUserMeta}>
                • {trend.month}: {trend.count} migraines
              </Text>
            ))}
            <Text style={styles.supportUserMeta}>Trend: {trendDirection}</Text>
          </View>

          <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]} onPress={() => navigation.goBack()}>
            <Text style={styles.submitButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrustedFullLogsScreen({ navigation, selectedUser, logs }) {
  const avgIntensity =
    logs.length > 0 ? (logs.reduce((sum, log) => sum + log.intensity, 0) / logs.length).toFixed(1) : '0.0';
  const avgDuration =
    logs.length > 0 ? (logs.reduce((sum, log) => sum + log.durationHours, 0) / logs.length).toFixed(1) : '0.0';

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconWrapper}>
            <MaterialCommunityIcons name="history" size={22} color="#7f011f" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.sectionTitle}>Migraine History</Text>
            <Text style={styles.sectionSubtitle}>All logs shared by {selectedUser.name}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.accountCard}>
            <Text style={styles.supportUserMeta}>📊 Total: {logs.length} logs</Text>
            <Text style={styles.supportUserMeta}>📈 Avg intensity: {avgIntensity}/10</Text>
            <Text style={styles.supportUserMeta}>⏱️ Avg duration: {avgDuration} hrs</Text>
          </View>

          {logs.map((log) => (
            <View key={log.id} style={styles.accountCard}>
              <Text style={styles.trustedLogDate}>{formatDateTimeLabel(log.dateTime)}</Text>
              <View style={styles.trustedLogSeverityRow}>
                <View style={styles.trustedSeverityTrack}>
                  <View style={[styles.trustedSeverityFill, { width: `${log.intensity * 10}%`, backgroundColor: getSeverityColor(log.intensity) }]} />
                </View>
                <Text style={[styles.trustedLogSeverityValue, { color: getSeverityColor(log.intensity) }]}>{log.intensity}/10</Text>
              </View>
              <Text style={styles.trustedLogDetail}>Duration: {log.durationHours} hours</Text>
              <Text style={styles.trustedLogDetail}>Symptoms: {log.symptoms.join(', ')}</Text>
              <Text style={styles.trustedLogDetail}>
                {log.cyclePhase} · Day {log.cycleDay}
              </Text>
              <Text style={styles.trustedLogDetail}>Triggers: {log.triggers.join(', ') || 'Not shared'}</Text>
              <Text style={styles.trustedLogDetail}>Medications: {log.medications.join(', ') || 'Not shared'}</Text>
            </View>
          ))}

          <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]} onPress={() => navigation.goBack()}>
            <Text style={styles.submitButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrustedAlertsScreen({ selectedUser, alerts, onAcknowledge }) {
  const activeAlerts = alerts
    .filter((alertItem) => alertItem.userId === selectedUser.id && !alertItem.acknowledged && !alertItem.resolved)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  const historyAlerts = alerts
    .filter((alertItem) => alertItem.userId === selectedUser.id && (alertItem.acknowledged || alertItem.resolved))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const hasAcknowledged = alerts.some((alertItem) => alertItem.userId === selectedUser.id && alertItem.acknowledged);

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <CompactScreenHeading icon="alarm-light-outline" eyebrow="CARE CIRCLE" title="Alerts" subtitle={`Stay ready to support ${selectedUser.name}`} />

        <View style={styles.formContainer}>
          {activeAlerts.length === 0 ? (
            <View style={styles.accountCard}>
              <Text style={styles.supportUserMeta}>
                No alerts to show. You will be notified here in case of an emergency.
              </Text>
            </View>
          ) : (
            activeAlerts.map((alertItem) => {
              const high = alertItem.severity === 'high';
              return (
                <View key={alertItem.id} style={[styles.emergencyCard, high ? styles.emergencyCardHigh : styles.emergencyCardMedium]}>
                  <Text style={styles.emergencyTitle}>{high ? '🔴 High Severity Alert' : '🟠 Medium Severity Alert'}</Text>
                  <Text style={styles.emergencyText}>User: {selectedUser.name}</Text>
                  <Text style={styles.emergencyText}>Time: {getRelativeTime(alertItem.occurredAt)}</Text>
                  <Text style={styles.emergencyText}>Severity: {alertItem.intensity}/10</Text>
                  <Text style={styles.emergencyText}>{alertItem.message}</Text>
                  <Pressable
                    style={({ pressed }) => [styles.smallPrimaryButton, styles.inlineActionButton, pressed && styles.smallPrimaryButtonPressed]}
                    onPress={() => onAcknowledge(alertItem.id)}
                  >
                    <Text style={styles.smallPrimaryButtonText}>Acknowledge</Text>
                  </Pressable>
                </View>
              );
            })
          )}

          {hasAcknowledged ? (
            <View style={styles.accountCard}>
              <Text style={styles.accountSectionTitle}>How to Help</Text>
              <Text style={styles.supportUserMeta}>• Keep the environment quiet and dark</Text>
              <Text style={styles.supportUserMeta}>• Offer a cold compress</Text>
              <Text style={styles.supportUserMeta}>• Encourage them to rest</Text>
              <Text style={styles.supportUserMeta}>• Avoid strong smells or bright lights</Text>
              <Text style={styles.supportUserMeta}>• Help them take prescribed medication if needed</Text>
              <Text style={styles.supportUserMeta}>• Stay calm and reassuring</Text>
            </View>
          ) : null}

          <View style={styles.accountCard}>
            <Text style={styles.accountSectionTitle}>Alert History</Text>
            {historyAlerts.length === 0 ? (
              <Text style={styles.supportUserMeta}>No history yet.</Text>
            ) : (
              historyAlerts.map((alertItem) => (
                <Pressable
                  key={`history-${alertItem.id}`}
                  style={({ pressed }) => [styles.historyRow, pressed && styles.addButtonPressed]}
                  onPress={() =>
                    Alert.alert(
                      'Alert Details',
                      `${formatDateTimeLabel(alertItem.occurredAt)}\nSeverity: ${alertItem.intensity}/10\nStatus: ${alertItem.resolved ? 'Resolved' : 'Acknowledged'}\n${alertItem.message}`
                    )
                  }
                >
                  <View>
                    <Text style={styles.historyTitle}>{formatDateTimeLabel(alertItem.occurredAt)}</Text>
                    <Text style={styles.historySubtitle}>{alertItem.severity === 'high' ? 'High severity' : 'Medium severity'}</Text>
                  </View>
                  <Text style={styles.historyLength}>{alertItem.resolved ? 'Resolved' : 'Acknowledged'}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrustedAccountScreen({
  navigation,
  selectedUserId,
  onSelectUser,
  notificationSettings,
  onToggleNotification,
  onCycleAlertTone,
}) {
  const supportedUser = SUPPORTED_USERS.find((item) => item.id === selectedUserId) || SUPPORTED_USERS[0];

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'Are you sure you want to delete your account? This will remove your access to all shared data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            const rootNavigation = navigation.getParent();
            if (rootNavigation) {
              rootNavigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              return;
            }
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You can sign back in at any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          const rootNavigation = navigation.getParent();
          if (rootNavigation) {
            rootNavigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            return;
          }
          navigation.navigate('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        <CompactScreenHeading icon="account-cog-outline" eyebrow="CARE CIRCLE" title="Your account" subtitle="Profile, access, and notification settings" />

        <View style={styles.formContainer}>
          <View style={styles.accountCard}>
            <View style={styles.cardTitleRow}><Text style={styles.accountSectionTitle}>Account</Text><MaterialCommunityIcons name="account-heart-outline" size={20} color="#a72e4e" /></View>
            <View style={styles.profileSummaryRow}>
              <View style={styles.profileMonogram}><Text style={styles.profileMonogramText}>M</Text></View>
              <View><Text style={styles.profileName}>{TRUSTED_PERSON_PROFILE.displayName}</Text><Text style={styles.profileRole}>{TRUSTED_PERSON_PROFILE.role}</Text></View>
            </View>
            <View style={styles.detailRow}><MaterialCommunityIcons name="email-outline" size={16} color="#a72e4e" /><Text style={styles.detailText}>{TRUSTED_PERSON_PROFILE.email}</Text></View>
            <Pressable style={({ pressed }) => [styles.smallGhostButton, styles.inlineActionButton, pressed && styles.addButtonPressed]} onPress={() => Alert.alert('Edit Profile', 'Profile editing is a mock action.')}>
              <Text style={styles.smallGhostButtonText}>Edit Profile</Text>
            </Pressable>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.cardTitleRow}><Text style={styles.accountSectionTitle}>Users You Support</Text><Text style={styles.readOnlyInline}>SHARED CARE</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switchUserChipsRow}>
              {SUPPORTED_USERS.map((user) => {
                const active = user.id === selectedUserId;
                return (
                  <Pressable
                    key={`support-${user.id}`}
                    style={({ pressed }) => [
                      styles.switchUserChip,
                      active && styles.switchUserChipActive,
                      pressed && styles.addButtonPressed,
                    ]}
                    onPress={() => onSelectUser(user.id)}
                  >
                    <Text style={[styles.switchUserChipText, active && styles.switchUserChipTextActive]}>{user.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.supportedUserHighlight}>
            <View style={styles.supportUserRow}>
              <View style={styles.statusDotActive} />
              <Text style={styles.supportUserName}>
                {supportedUser.name} · {supportedUser.relationship}
              </Text>
            </View>
            <Text style={styles.supportUserMeta}>Access Level: {supportedUser.accessLevel}</Text>
            <Text style={styles.supportUserMeta}>Status: {supportedUser.status}</Text>
            </View>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.cardTitleRow}><Text style={styles.accountSectionTitle}>What You Can View</Text><MaterialCommunityIcons name="shield-check-outline" size={20} color="#a72e4e" /></View>
            <Text style={styles.supportUserMeta}>☑️ Migraine Logs</Text>
            <Text style={styles.supportUserMeta}>☑️ Cycle Data</Text>
            <Text style={styles.supportUserMeta}>☑️ Insights</Text>
            <Text style={styles.supportUserMeta}>☑️ Emergency Alerts</Text>
            <View style={styles.readOnlyBadge}>
              <Text style={styles.readOnlyBadgeText}>🔒 View Only</Text>
            </View>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.cardTitleRow}><Text style={styles.accountSectionTitle}>Notification Settings</Text><MaterialCommunityIcons name="bell-cog-outline" size={20} color="#a72e4e" /></View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceTitle}>Receive Emergency Alerts</Text>
              <Pressable
                style={({ pressed }) => [styles.toggleButton, notificationSettings.receiveEmergency && styles.toggleButtonActive, pressed && styles.addButtonPressed]}
                onPress={() => onToggleNotification('receiveEmergency')}
              >
                <Text style={[styles.toggleButtonText, notificationSettings.receiveEmergency && styles.toggleButtonTextActive]}>
                  {notificationSettings.receiveEmergency ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceTitle}>Push Notifications</Text>
              <Pressable
                style={({ pressed }) => [styles.toggleButton, notificationSettings.push && styles.toggleButtonActive, pressed && styles.addButtonPressed]}
                onPress={() => onToggleNotification('push')}
              >
                <Text style={[styles.toggleButtonText, notificationSettings.push && styles.toggleButtonTextActive]}>
                  {notificationSettings.push ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceTitle}>Email Alerts</Text>
              <Pressable
                style={({ pressed }) => [styles.toggleButton, notificationSettings.email && styles.toggleButtonActive, pressed && styles.addButtonPressed]}
                onPress={() => onToggleNotification('email')}
              >
                <Text style={[styles.toggleButtonText, notificationSettings.email && styles.toggleButtonTextActive]}>
                  {notificationSettings.email ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceTitle}>SMS Alerts</Text>
              <Pressable
                style={({ pressed }) => [styles.toggleButton, notificationSettings.sms && styles.toggleButtonActive, pressed && styles.addButtonPressed]}
                onPress={() => onToggleNotification('sms')}
              >
                <Text style={[styles.toggleButtonText, notificationSettings.sms && styles.toggleButtonTextActive]}>
                  {notificationSettings.sms ? 'On' : 'Off'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceTitle}>Alert Sound</Text>
              <Pressable
                style={({ pressed }) => [styles.smallGhostButton, pressed && styles.addButtonPressed]}
                onPress={onCycleAlertTone}
              >
                <Text style={styles.smallGhostButtonText}>{notificationSettings.alertSound}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.accountCard}>
            <View style={styles.cardTitleRow}><Text style={styles.accountSectionTitle}>Account Management</Text><MaterialCommunityIcons name="cog-outline" size={20} color="#a72e4e" /></View>
            <Pressable style={({ pressed }) => [styles.smallGhostButton, styles.inlineActionButton, pressed && styles.addButtonPressed]} onPress={() => Alert.alert('Edit Personal Details', 'Personal detail editing is a mock action.')}>
              <Text style={styles.smallGhostButtonText}>Edit Personal Details</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.smallGhostButton, styles.inlineActionButton, pressed && styles.addButtonPressed]} onPress={() => Alert.alert('Change Password', 'Password change is a mock action.')}>
              <Text style={styles.smallGhostButtonText}>Change Password</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout-variant" size={17} color="#7f011f" />
              <Text style={styles.logoutButtonText}>Log out</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]} onPress={handleDeleteAccount}>
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrustedHomeStack({ selectedUser, sharedInsights, logs, activeAlert, onSelectUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrustedHomeMain">
        {(props) => (
          <TrustedHomeScreen
            {...props}
            selectedUser={selectedUser}
            sharedInsights={sharedInsights}
            logs={logs}
            activeAlert={activeAlert}
            onSelectUser={onSelectUser}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TrustedFullInsights">
        {(props) => <TrustedFullInsightsScreen {...props} selectedUser={selectedUser} sharedInsights={sharedInsights} />}
      </Stack.Screen>
      <Stack.Screen name="TrustedFullLogs">
        {(props) => <TrustedFullLogsScreen {...props} selectedUser={selectedUser} logs={logs} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function TrustedApp() {
  const insets = useSafeAreaInsets();
  const [selectedUserId, setSelectedUserId] = useState(SUPPORTED_USERS[0].id);
  const [alerts, setAlerts] = useState([
    {
      id: 'alert-1',
      userId: 'sarah',
      severity: 'high',
      intensity: 8,
      message: 'Severe migraine attack detected',
      occurredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      acknowledged: false,
      resolved: false,
    },
    {
      id: 'alert-2',
      userId: 'sarah',
      severity: 'medium',
      intensity: 6,
      message: 'Moderate migraine with aura reported',
      occurredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      acknowledged: true,
      resolved: false,
    },
    {
      id: 'alert-3',
      userId: 'emma',
      severity: 'high',
      intensity: 8,
      message: 'Severe migraine alert sent',
      occurredAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      acknowledged: true,
      resolved: true,
    },
  ]);
  const [notificationSettings, setNotificationSettings] = useState({
    receiveEmergency: true,
    push: true,
    email: true,
    sms: false,
    alertSound: 'Default',
  });

  const [fontsLoaded] = useFonts({
    'ReemKufi-Medium': require('../assets/fonts/ReemKufi-Medium.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium': require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light': require('../assets/fonts/Plein-Light.otf'),
  });

  const selectedUser = useMemo(
    () => SUPPORTED_USERS.find((item) => item.id === selectedUserId) || SUPPORTED_USERS[0],
    [selectedUserId]
  );
  const sharedInsights = USER_INSIGHTS[selectedUser.id] || USER_INSIGHTS.sarah;
  const logs = [...(USER_LOGS[selectedUser.id] || [])].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
  const activeAlert = alerts
    .filter((item) => item.userId === selectedUser.id && !item.acknowledged && !item.resolved)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7f011f" />
      </SafeAreaView>
    );
  }

  const acknowledgeAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, acknowledged: true } : item))
    );
    Alert.alert('Acknowledged', 'Alert marked as acknowledged.');
  };

  const toggleNotificationSetting = (field) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const cycleAlertTone = () => {
    const options = ['Default', 'Gentle', 'Alert', 'Calm', 'Soft'];
    const currentIndex = options.indexOf(notificationSettings.alertSound);
    const next = options[(currentIndex + 1) % options.length];
    setNotificationSettings((prev) => ({ ...prev, alertSound: next }));
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#7f011f',
        tabBarInactiveTintColor: '#b8a9b0',
        tabBarStyle: [
          styles.tabBar,
          {
            height: 70 + insets.bottom,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            HomeTab: 'home-heart',
            AlertsTab: 'alarm-light',
            AccountTab: 'account-shield-outline',
          };
          return <MaterialCommunityIcons name={iconMap[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" options={{ title: 'Home' }}>
        {() => (
          <TrustedHomeStack
            selectedUser={selectedUser}
            sharedInsights={sharedInsights}
            logs={logs}
            activeAlert={activeAlert}
            onSelectUser={setSelectedUserId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="AlertsTab" options={{ title: 'Alerts' }}>
        {(props) => (
          <TrustedAlertsScreen
            {...props}
            selectedUser={selectedUser}
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="AccountTab" options={{ title: 'Account' }}>
        {(props) => (
          <TrustedAccountScreen
            {...props}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            notificationSettings={notificationSettings}
            onToggleNotification={toggleNotificationSetting}
            onCycleAlertTone={cycleAlertTone}
          />
        )}
      </Tab.Screen>
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
    backgroundColor: '#fcf8fa',
  },
  screenContent: {
    paddingBottom: 32,
  },
  trustedHero: { minHeight: 188, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  heroGlowTop: { position: 'absolute', width: 170, height: 170, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.11)', top: -80, right: -35 },
  heroGlowBottom: { position: 'absolute', width: 130, height: 130, borderRadius: 70, backgroundColor: 'rgba(255,218,226,0.13)', bottom: -65, left: 70 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  heroAvatarText: { color: '#ffffff', fontFamily: 'ReemKufi-Medium', fontSize: 22 },
  heroEyebrow: { fontFamily: 'Plein-Medium', fontSize: 10, color: 'rgba(255,255,255,0.74)', letterSpacing: 1.4 },
  heroTitle: { fontFamily: 'ReemKufi-Medium', fontSize: 23, color: '#ffffff', marginTop: 1 },
  heroSubtitle: { fontFamily: 'Plein-Regular', fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 1 },
  heroShield: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  heroStatusRow: { marginTop: 22, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(57,0,14,0.22)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  heroStatusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#b8f4cb' },
  heroStatusText: { fontFamily: 'Plein-Medium', fontSize: 11, color: '#ffffff' },
  compactHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, backgroundColor: '#fffafd', borderBottomWidth: 1, borderBottomColor: '#f0e5e9' },
  compactHeadingIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#f9e9ee', alignItems: 'center', justifyContent: 'center' },
  compactHeadingEyebrow: { fontFamily: 'Plein-Medium', fontSize: 10, color: '#a72e4e', letterSpacing: 1.2 },
  compactHeadingTitle: { fontFamily: 'ReemKufi-Medium', fontSize: 21, color: '#7f011f', marginTop: 1 },
  compactHeadingSubtitle: { fontFamily: 'Plein-Regular', fontSize: 12, color: '#816b73', marginTop: 1 },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efe9ec',
  },
  sectionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f7ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Plein-Light',
    color: '#8a7a80',
    marginTop: 2,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eee7ea',
    padding: 16,
    shadowColor: '#4b0a1a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  currentUserCard: { borderColor: '#ead7de', backgroundColor: '#fffafc' },
  profileSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 3, marginBottom: 14 },
  profileMonogram: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4dfe6' },
  profileMonogramText: { fontFamily: 'ReemKufi-Medium', fontSize: 18, color: '#7f011f' },
  profileName: { fontFamily: 'Plein-Medium', fontSize: 14, color: '#33252a' },
  profileRole: { fontFamily: 'Plein-Regular', fontSize: 11, color: '#816b73', marginTop: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#f1e8eb', paddingTop: 12 },
  detailText: { fontFamily: 'Plein-Regular', fontSize: 12, color: '#5b4f55' },
  supportedUserHighlight: { marginTop: 6, padding: 12, backgroundColor: '#fff7f9', borderRadius: 12, borderWidth: 1, borderColor: '#f0dde4' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  readOnlyInline: { color: '#a72e4e', backgroundColor: '#fae8ed', borderRadius: 999, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 3, fontSize: 9, letterSpacing: 0.6, fontFamily: 'Plein-Medium' },
  currentUserTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: '#eaf7ef' },
  statusPillText: { fontSize: 10, fontFamily: 'Plein-Medium', color: '#267545' },
  insightStatsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  insightStatChip: { flex: 1, minHeight: 94, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 13, alignItems: 'center', justifyContent: 'center', gap: 3 },
  insightStatValue: { fontSize: 17, fontFamily: 'ReemKufi-Medium', color: '#45202a', textAlign: 'center' },
  insightStatLabel: { fontSize: 10, fontFamily: 'Plein-Regular', color: '#796a70', textAlign: 'center' },
  insightStatChipRose: { backgroundColor: '#fff0f4' },
  insightStatChipPlum: { backgroundColor: '#f7eff8' },
  insightStatChipGold: { backgroundColor: '#fff6e9' },
  correlationPill: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9, borderRadius: 10, backgroundColor: '#fff5ea' },
  correlationPillText: { flex: 1, fontFamily: 'Plein-Medium', fontSize: 11, color: '#76502b' },
  accountSectionTitle: {
    fontSize: 15,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    marginBottom: 8,
  },
  supportUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDotActive: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#2f9b59',
  },
  supportUserName: {
    fontSize: 13,
    fontFamily: 'Plein-Medium',
    color: '#211a1e',
  },
  supportUserMeta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#5b4f55',
    lineHeight: 18,
  },
  switcherTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5d9df',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  switcherTriggerLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#614e56',
  },
  switcherMenu: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece3e8',
    overflow: 'hidden',
  },
  switcherOption: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0eaed',
  },
  switcherOptionActive: {
    backgroundColor: '#fff2f6',
  },
  switcherOptionText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#4f4349',
  },
  switcherOptionTextActive: {
    color: '#7f011f',
    fontFamily: 'Plein-Medium',
  },
  inlineActionButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  trustedLogCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee7ea',
    backgroundColor: '#ffffff',
    padding: 10,
  },
  trustedLogDate: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#352a30',
  },
  trustedLogSeverityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  trustedSeverityTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#ede7ea',
    overflow: 'hidden',
  },
  trustedSeverityFill: {
    height: '100%',
    borderRadius: 999,
  },
  trustedLogSeverityValue: {
    width: 34,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: 'Plein-Medium',
  },
  trustedLogDetail: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#5f5258',
  },
  emergencyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f4c3ce',
    backgroundColor: '#fff1f4',
    padding: 14,
  },
  emergencyCardHigh: {
    borderColor: '#f4bcc8',
    backgroundColor: '#fff0f3',
  },
  emergencyCardMedium: {
    borderColor: '#f1d8bc',
    backgroundColor: '#fff6ec',
  },
  emergencyTitle: {
    fontSize: 15,
    fontFamily: 'ReemKufi-Medium',
    color: '#b62645',
    marginBottom: 6,
  },
  emergencyText: {
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#6a3c49',
    marginBottom: 4,
    lineHeight: 18,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  analysisLabel: {
    width: 78,
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#51464c',
  },
  analysisBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#eee7ea',
    overflow: 'hidden',
  },
  analysisBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  analysisValue: {
    width: 22,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#51464c',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#efe9ec',
  },
  historyTitle: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#3a2f34',
  },
  historySubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'Plein-Regular',
    color: '#887880',
  },
  historyLength: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
  },
  smallGhostButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d1d5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  smallGhostButtonText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#4c4146',
  },
  logoutButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d9b3c0',
    backgroundColor: '#fff7f9',
    paddingVertical: 10,
  },
  logoutButtonPressed: { backgroundColor: '#f9e4ea' },
  logoutButtonText: { fontSize: 12, fontFamily: 'Plein-Medium', color: '#7f011f' },
  smallPrimaryButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#7f011f',
  },
  smallPrimaryButtonPressed: {
    backgroundColor: '#a41b3b',
  },
  smallPrimaryButtonText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#ffffff',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#efe9ec',
    gap: 10,
  },
  preferenceTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Plein-Regular',
    color: '#3b2f34',
  },
  toggleButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d9d1d5',
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
    color: '#6c5c63',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  readOnlyBadge: {
    marginTop: 10,
    borderRadius: 999,
    alignSelf: 'flex-start',
    backgroundColor: '#f2edf0',
    borderWidth: 1,
    borderColor: '#e3dce0',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  readOnlyBadgeText: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#6e6067',
  },
  switchUserChipsRow: {
    gap: 8,
    paddingBottom: 8,
  },
  switchUserChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dfd6db',
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  switchUserChipActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  switchUserChipText: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    color: '#5f5258',
  },
  switchUserChipTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    backgroundColor: '#a41b3b',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Plein-Medium',
  },
  dangerButton: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#be2d4a',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonPressed: {
    backgroundColor: '#d54a67',
  },
  dangerButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Plein-Medium',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#867880',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardPressed: {
    opacity: 0.8,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#ede6ea',
    backgroundColor: '#ffffff',
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Plein-Medium',
    marginBottom: 4,
  },
});
