import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WHAT_YOU_CAN_DO = [
  {
    icon: 'eye-outline',
    title: 'See shared updates',
    description: 'View the migraine and cycle data they\u2019ve chosen to share with you.',
  },
  {
    icon: 'bell-alert-outline',
    title: 'Get alerts during flare-ups',
    description: 'We\u2019ll let you know when they log a severe migraine so you can reach out.',
  },
  {
    icon: 'hand-heart-outline',
    title: 'Offer support',
    description: 'A small check-in can mean a lot. You\u2019ll see what\u2019s happening and when to help.',
  },
];

export default function TrustedWelcomeScreen({ navigation, setAuthFlowActive }) {
  const handleContinue = () => {
    // Flow is complete — release the guard so the authed stack takes over
    setAuthFlowActive?.(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'TrustedApp' }],
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-10 py-8">
          <View className="mb-10 mt-4 items-center">
            <Text
              className="mb-4 text-center font-reem text-5xl text-text-primary"
              style={{ lineHeight: 60 }}
            >
              Welcome!
            </Text>
            <Text className="text-center font-plein text-base leading-7 text-text-secondary">
              You've joined Miss Migraine as a trusted person. Here's what you can do.
            </Text>
          </View>

          <View className="mb-10 gap-4">
            {WHAT_YOU_CAN_DO.map((item) => (
              <View
                key={item.title}
                className="flex-row items-start gap-4 rounded-[24px] bg-surface p-5"
              >
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-elevated">
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="#ad89dc"
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-plein-medium text-base text-text-primary mb-1">
                    {item.title}
                  </Text>
                  <Text className="font-plein text-sm leading-6 text-text-muted">
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text className="mb-8 text-center font-plein text-sm leading-6 text-text-muted">
            You won't be able to edit their data, only view what they've shared with you.
          </Text>

          <Pressable
            onPress={handleContinue}
            className="items-center rounded-full bg-brand py-4 active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-base text-text-inverse">
              Let's begin
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}