import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoadingScreen() {
  const [fontsLoaded] = useFonts({
    'ReemKufi-Bold': require('../assets/fonts/ReemKufi-Bold.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium': require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light': require('../assets/fonts/Plein-Light.otf'),
  });

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.85,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  if (!fontsLoaded) {
    return (
      <LinearGradient colors={['#7f011f', '#5a0015']} style={styles.container}>
        <ActivityIndicator size="large" color="#f3eed9" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#7f011f', '#5a0015', '#3d000e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.decorBlob, styles.decorBlobTop]} />
          <View style={[styles.decorBlob, styles.decorBlobBottom]} />
          <View style={[styles.decorBlob, styles.decorBlobRight]} />

          <Animated.View style={[styles.logoWrapper, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
            <View style={styles.outerRing}>
              <View style={styles.middleRing}>
                <LinearGradient colors={['#f5e6eb', '#fdf6f8']} style={styles.gradientCircle}>
                  <MaterialCommunityIcons name="heart-pulse" size={40} color="#7f011f" />
                </LinearGradient>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.title}>Miss Migraine</Text>
          <Text style={styles.subtitle}>Track your migraines, understand your patterns</Text>

          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="rgba(243, 238, 217, 0.7)" />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  logoWrapper: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRing: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontFamily: 'ReemKufi-Bold',
    fontSize: 40,
    color: '#f3eed9',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Plein-Light',
    color: 'rgba(243, 238, 217, 0.75)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  loaderContainer: {
    marginTop: 10,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Plein-Light',
    color: 'rgba(243, 238, 217, 0.5)',
    textAlign: 'center',
    marginTop: 10,
  },
  decorBlob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decorBlobTop: {
    width: 180,
    height: 180,
    top: -60,
    right: -50,
    backgroundColor: 'rgba(255, 114, 123, 0.08)',
  },
  decorBlobBottom: {
    width: 220,
    height: 220,
    bottom: -80,
    left: -60,
    backgroundColor: 'rgba(255, 200, 210, 0.06)',
  },
  decorBlobRight: {
    width: 100,
    height: 100,
    bottom: 120,
    right: -30,
    backgroundColor: 'rgba(255, 150, 165, 0.05)',
  },
});
