import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OnboardingIntroScreen({ navigation, route }) {
  const { name = '' } = route.params?.answers ?? {};

  const handleContinue = () => {
    navigation.navigate('OnboardingOnset', {
      answers: route.params?.answers ?? {},
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Back arrow */}
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={12}
        className="absolute top-12 left-4 z-10 p-2"
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={26}
          color="#f1ebf9"
        />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header */}
          <View className="items-center mb-8">
            <Text
              className="mb-3 text-center font-reem text-5xl text-text-primary"
              style={{ lineHeight: 54 }}
            >
              Hi {name}!
            </Text>
            <Text className="text-center font-plein-medium text-lg text-text-secondary leading-7">
              It's so good to have you here.
            </Text>
          </View>

          {/* Body copy */}
          <Text className="mb-4 text-center font-plein text-lg text-text-muted leading-7">
            To personalize your experience and help our system support you better, we'd like to ask a few quick questions.
          </Text>
          <Text className="text-center font-plein text-lg text-text-muted leading-7">
            There are no wrong answers — just what's true for you.
          </Text>

          {/* Continue button */}
          <Pressable
            onPress={handleContinue}
            className="mt-10 items-center rounded-full bg-brand py-4 active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-lg text-text-primary">
              Let's begin
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}