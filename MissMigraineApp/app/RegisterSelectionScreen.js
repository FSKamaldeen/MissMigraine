import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterSelectionScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState('main_user');
  const [fontsLoaded] = useFonts({
    'ReemKufi-Medium': require('../assets/fonts/ReemKufi-Medium.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium': require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light': require('../assets/fonts/Plein-Light.otf'),
  });

  const handleConfirm = () => {
    if (selectedRole === 'main_user') {
      navigation.navigate('UserRegistration');
      return;
    }

    if (selectedRole === 'trusted_person') {
      navigation.navigate('TrustedPersonRegistration');
      return;
    }

    Alert.alert('Please choose who you are registering as.');
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
      <View style={styles.content}>
        <View style={styles.headerMark}>
          <MaterialCommunityIcons name="heart-pulse" size={25} color="#7f011f" />
        </View>
        <Text style={styles.heading}>Let’s make this personal</Text>
        <Text style={styles.subheading}>Choose the kind of account you need.</Text>

        <View style={styles.optionsWrap}>
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              selectedRole === 'main_user' && styles.optionCardActive,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() => setSelectedRole('main_user')}
          >
            <View style={styles.optionIcon}><MaterialCommunityIcons 
                  name="account-heart-outline" 
                  size={24} 
                  color={selectedRole === 'main_user' ? '#ffffff' : '#7f011f'} />
            </View>
            <Text style={[styles.optionTitle, selectedRole === 'main_user' && styles.optionTitleActive]}>Main User</Text>
            <Text style={[styles.optionDescription, selectedRole === 'main_user' && styles.optionDescriptionActive]}>
              Track your migraines, cycle, and insights
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              selectedRole === 'trusted_person' && styles.optionCardActive,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() => setSelectedRole('trusted_person')}
          >
            <View style={styles.optionIcon}><MaterialCommunityIcons 
                  name="shield-heart-outline" 
                  size={24} 
                  color={selectedRole === 'trusted_person' ? '#ffffff' : '#7f011f'} />
            </View>
            <Text style={[styles.optionTitle, selectedRole === 'trusted_person' && styles.optionTitleActive]}>Trusted Person</Text>
            <Text style={[styles.optionDescription, selectedRole === 'trusted_person' && styles.optionDescriptionActive]}>
              View shared data and receive alerts
            </Text>
          </Pressable>
        </View>

        <View style={styles.bottomArea}>
          <Pressable style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.backLinkWrap, pressed && styles.linkPressed]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backLink}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 30,
    fontFamily: 'ReemKufi-Medium',
    color: '#7f011f',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerMark: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#f8e7ed', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 22, marginBottom: 14 },
  subheading: { fontSize: 14, fontFamily: 'Plein-Light', color: '#826872', textAlign: 'center', marginBottom: 24 },
  optionsWrap: {
    gap: 14,
  },
  optionCard: {
    borderWidth: 1.5,
    borderColor: '#e5d5db',
    backgroundColor: '#fff7f9',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  optionCardActive: {
    borderColor: '#7f011f',
    backgroundColor: '#7f011f',
  },
  optionCardPressed: {
    opacity: 0.8,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Plein-Medium',
    color: '#7f011f',
    marginBottom: 4,
  },
  optionIcon: { marginBottom: 9 },
  optionTitleActive: {
    color: '#ffffff',
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'Plein-Regular',
    color: '#684a52',
    lineHeight: 19,
  },
  optionDescriptionActive: {
    color: '#f8e9ee',
  },
  bottomArea: {
    marginTop: 'auto',
  },
  confirmButton: {
    backgroundColor: '#7f011f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonPressed: {
    backgroundColor: '#ff727b',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Plein-Medium',
  },
  backLinkWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLink: {
    color: '#7f011f',
    fontSize: 14,
    fontFamily: 'Plein-Medium',
  },
  linkPressed: {
    opacity: 0.65,
  },
});
