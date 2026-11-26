import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import InsightCard from './components/InsightCard';

// Cards

const INSIGHT_CARDS = [
  {
    key: 'migraine',
    screen: 'MigraineInsight',
    title: 'Migraine overview',
    description: 'Your intensity, aura & symptoms',
    icon: 'head-alert-outline',
    bgColor: '#472376',
    accentColor: '#f1ebf9',
  },
  {
    key: 'cycle',
    screen: 'CycleInsight',
    title: 'Cycle & migraine',
    description: 'How your phases affect attacks',
    icon: 'calendar-heart',
    bgColor: '#5f2f9d',
    accentColor: '#f1ebf9',
  },
  {
    key: 'meds',
    screen: 'MedsInsight',
    title: 'Medication effectiveness',
    description: "What's working and what isn't",
    icon: 'pill',
    bgColor: '#763bc4',
    accentColor: '#f1ebf9',
  },
  {
    key: 'trends',
    screen: 'TrendsInsight',
    title: 'Frequency trends',
    description: 'How often attacks happen over time',
    icon: 'chart-timeline-variant',
    bgColor: '#9262d0',
    accentColor: '#f1ebf9',
  },
];

export default function InsightsScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <Text
            className="font-reem text-4xl text-text-primary"
            style={{ lineHeight: 48 }}
          >
            Your insights
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Personalised patterns from your data
          </Text>
        </View>

        {/* Cards */}
        <View className="gap-3 px-6">
          {INSIGHT_CARDS.map((card) => (
            <InsightCard
              key={card.key}
              title={card.title}
              description={card.description}
              icon={card.icon}
              bgColor={card.bgColor}
              accentColor={card.accentColor}
              onPress={() => navigation.navigate(card.screen)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}