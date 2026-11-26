import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useLogDraft } from '../LogDraftContext';

export default function LogNotesStep({ navigation, route }) {
  const { draft, updateDraft } = useLogDraft();

  const returnTo = route.params?.returnTo;

  const handleContinue = () => {
    if (returnTo) {
      navigation.navigate(returnTo);
    } else {
      navigation.navigate('LogReview');
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-1 px-8 pt-4">

        {/* Back Arrow */}
        <View className="mb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} className="self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="h-1.5 w-full mb-8 overflow-hidden rounded-full bg-elevated">
          <View
            style={{
              width: `${(6 / 6) * 100}%`,
              height: '100%',
              backgroundColor: '#ad89dc',
              borderRadius: 999,
            }}
          />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Question */}
          <View className="mt-2 mb-8">
            <Text className="font-reem text-4xl text-text-primary mb-3">
              Anything else to note?
            </Text>
            <Text className="font-plein text-base text-text-secondary leading-6">
              Add any context that might matter later.
            </Text>
          </View>

          {/* Notes input */}
          <TextInput
            value={draft.notes}
            onChangeText={(text) => updateDraft({ notes: text })}
            placeholder="How it felt, what you noticed, anything unusual…"
            placeholderTextColor="#c8b0e8"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            className="rounded-2xl bg-elevated px-5 py-4 font-plein text-base text-text-primary"
            style={{ minHeight: 160 }}
          />
        </ScrollView>

        {/* Fixed Review Button */}
        <View className="pb-14 pt-4">
          <Pressable
            onPress={handleContinue}
            className="items-center rounded-full py-4 bg-brand active:bg-brand-dark"
          >
            <Text className="font-plein-medium text-base text-text-inverse">
              Review
            </Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}