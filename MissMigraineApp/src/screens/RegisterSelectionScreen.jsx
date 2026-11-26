import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterSelectionScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState('main_user');

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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Back arrow */}
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          className="absolute top-4 left-4 z-10 p-2"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#f1ebf9"
          />
        </Pressable>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-8 pt-40 pb-12">
            {/* Header */}
            <Text className="mb-2 text-center font-reem text-5xl text-text-primary"
                  style={{ lineHeight: 52 }}
            >
              Who's joining?
            </Text>
            <Text className="mb-10 text-center font-plein text-lg text-text-muted">
              Choose how you'll use Miss Migraine.
            </Text>

            {/* Options */}
            <View className="gap-4">
              {/* Main User */}
              <Pressable
                onPress={() => setSelectedRole('main_user')}
              className={`rounded-3xl border-[1.5px] p-6 ${
                selectedRole === 'main_user'
                  ? 'border-brand-light bg-brand-dark/30'
                  : 'border-outline bg-surface'
              }`}
              >
                <Text
                  className={`mb-2 font-plein-medium text-xl ${
                    selectedRole === 'main_user'
                      ? 'text-text-primary'
                      : 'text-brand-light'
                  }`}
                >
                  I'm tracking my own migraines
                </Text>
                <Text
                  className={`font-plein text-[15px] leading-6 ${
                    selectedRole === 'main_user'
                      ? 'text-brand-light'
                      : 'text-text-muted'
                  }`}
                >
                  Track symptoms and share them with someone you trust.
                </Text>
              </Pressable>

              {/* Trusted Person */}
              <Pressable
                onPress={() => setSelectedRole('trusted_person')}
                className={`rounded-3xl border-[1.5px] p-6 ${
                  selectedRole === 'trusted_person'
                    ? 'border-brand-light bg-brand-dark/30'
                    : 'border-outline bg-surface'
                }`}
              >
                <Text
                  className={`mb-2 font-plein-medium text-xl ${
                    selectedRole === 'trusted_person'
                      ? 'text-text-primary'
                      : 'text-brand-light'
                  }`}
                >
                  I'm supporting someone else
                </Text>
                <Text
                  className={`font-plein text-[15px] leading-6 ${
                    selectedRole === 'trusted_person'
                      ? 'text-brand-light'
                      : 'text-text-muted'
                  }`}
                >
                  Stay informed, get notified during attacks, and offer support.
                </Text>
              </Pressable>
            </View>

            {/* Bottom area */}
            <View className="mt-auto pt-10 mb-6">
              <Pressable
                onPress={handleConfirm}
                className="items-center rounded-full bg-brand py-4 active:bg-brand-dark"
              >
                <Text className="font-plein-medium text-base text-text-primary">
                  Continue
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}