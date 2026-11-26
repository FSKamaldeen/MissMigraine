import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useCycleData } from '../../../../hooks/useCycleData';

import CycleMonthCalendar from './components/CycleMonthCalendar';
import CycleInputForm from './components/CycleInputForm';

export default function CycleTrackerScreen({ navigation }) {
  const {
    cycleData,
    phaseOverrides,
    getSummaryForDate,
    saveCycleData,
    loading,
  } = useCycleData();

  // Local State
  const [displayMonth, setDisplayMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });

  const selectedDateSummary = getSummaryForDate(selectedDate);
  const selectedDateKey = selectedDate.toISOString().split('T')[0];

  const handleShiftMonth = (offset) => {
    const next = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth() + offset,
      1
    );
    setDisplayMonth(next);
  };

  const handleSaveCycle = async (nextCycleData) => {
    // Validate basic logic before saving
    if (!nextCycleData.lastPeriodStartDate) {
      Alert.alert('Missing date', 'Please select when your last period started.');
      return;
    }

    const result = await saveCycleData(nextCycleData);
    
    if (result.success) {
      Alert.alert('Cycle updated', 'Your cycle details were saved.');
    } else {
      Alert.alert('Error', 'Could not save your cycle details. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background justify-center items-center">
        <Text className="font-plein text-text-muted">Loading cycle data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Custom Header */}
        <View className="px-6 pt-4 pb-6">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            className="mb-4 self-start"
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">
            Cycle Tracker
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Track your menstrual cycle and phases
          </Text>
        </View>

        <CycleMonthCalendar
          displayMonth={displayMonth}
          onShiftMonth={handleShiftMonth}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          getSummaryForDate={getSummaryForDate}
          phaseOverrides={phaseOverrides}
          selectedDateSummary={selectedDateSummary}
        />

        <CycleInputForm
          initialData={cycleData}
          onSave={handleSaveCycle}
        />
      </ScrollView>
    </SafeAreaView>
  );
}