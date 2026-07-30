import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeSection({ userName = 'Sarah' }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const stats = [
    { value: '0', label: 'Today', icon: 'calendar-today', color: '#7f011f' },
    { value: '3', label: 'This Week', icon: 'calendar-week', color: '#c0465f' },
    { value: '12', label: 'This Month', icon: 'calendar-month', color: '#8B4789' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7f011f', '#9d1d3e', '#c0465f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
        <View style={styles.headerPattern}>
          <View style={[styles.patternDot, styles.patternDot1]} />
          <View style={[styles.patternDot, styles.patternDot2]} />
          <View style={[styles.patternDot, styles.patternDot3]} />
        </View>
        <View style={styles.greetingRow}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="account" size={24} color="#ffffff" />
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello, {userName}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>
        <Text style={styles.motivationalText}>Let's track today and stay ahead of your patterns</Text>
      </LinearGradient>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: stat.color + '15' }]}>
              <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fcf9fa',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  patternDot1: {
    width: 120,
    height: 120,
    top: -40,
    right: -20,
  },
  patternDot2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -15,
  },
  patternDot3: {
    width: 50,
    height: 50,
    bottom: 30,
    right: 40,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  greetingContainer: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'ReemKufi-Medium',
    color: '#ffffff',
  },
  date: {
    fontSize: 13,
    fontFamily: 'Plein-Light',
    color: 'rgba(255,255,255,0.7)',
  },
  notificationBadge: {
    position: 'relative',
    padding: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff727b',
    borderWidth: 1.5,
    borderColor: '#7f011f',
  },
  motivationalText: {
    marginTop: 14,
    fontSize: 13,
    fontFamily: 'Plein-Light',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f5edf0',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'ReemKufi-Medium',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Plein-Medium',
    color: '#888888',
    textAlign: 'center',
  },
});
