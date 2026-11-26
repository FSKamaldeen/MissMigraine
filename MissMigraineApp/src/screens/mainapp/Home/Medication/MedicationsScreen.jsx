import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Inline hook — fetch all medications + manual refresh
// ─────────────────────────────────────────────────────

function useMedications() {
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeds = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('medications')
        .select('id, name, dosage, frequency, type, is_active, start_date, end_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setMeds(data || []);
      setError(null);
    } catch (err) {
      console.log('Error fetching medications:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMeds();
    }, [fetchMeds])
  );

  // Manual refresh — for pull-to-refresh
  const refresh = useCallback(() => fetchMeds(true), [fetchMeds]);

  return { meds, loading, refreshing, error, refresh };
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function MedicationsScreen({ navigation }) {
  const { meds, loading, refreshing, error, refresh } = useMedications();

  const activeMeds = meds.filter((m) => m.is_active);
  const pastMeds = meds.filter((m) => !m.is_active);

  const renderMedicationCard = (med, isPast = false) => {
    const subtitle = [med.dosage, med.frequency].filter(Boolean).join(' ― ');

    return (
      <Pressable
        key={med.id}
        onPress={() => navigation.navigate('MedicationForm', { medId: med.id })}
        className={`mb-3 flex-row items-center justify-between rounded-2xl bg-surface px-5 py-4 active:opacity-70 ${
          isPast ? 'opacity-50' : ''
        }`}
      >
        <View className="flex-1">
          <Text className="font-plein-medium text-base text-text-primary">
            {med.name}
          </Text>
          {!isPast && subtitle ? (
            <Text className="mt-1 font-plein text-sm text-text-muted">
              {subtitle}
            </Text>
          ) : null}
        </View>

        <MaterialCommunityIcons name="chevron-right" size={24} color="#ad89dc" />
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      
      {/* Header Area */}
      <View className="px-6 pt-4 pb-6">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          className="mb-4 self-start"
        >
          <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
        </Pressable>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-reem text-4xl text-text-primary">
              Medications
            </Text>
            <Text className="mt-1 font-plein text-base text-text-muted">
              Manage your prescriptions and logs
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate('MedicationForm')}
            className="h-10 w-10 items-center justify-center rounded-full bg-brand active:bg-brand-dark"
          >
            <MaterialCommunityIcons name="plus" size={24} color="#11081b" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#ad89dc"
            colors={['#ad89dc']}
          />
        }
      >
        {/* Loading (first mount only) */}
        {loading && !refreshing && (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#ad89dc" />
            <Text className="mt-4 font-plein text-sm text-text-muted">
              Loading medications...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View className="mx-6 rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={32}
              color="#472376"
            />
            <Text className="mt-3 text-center font-plein-medium text-base text-text-primary">
              Couldn't load medications
            </Text>
            <Text className="mt-1 text-center font-plein text-sm text-text-muted">
              Pull down to try again.
            </Text>
          </View>
        )}

        {/* Empty */}
        {!loading && !error && meds.length === 0 && (
          <View className="mx-6 rounded-[24px] border-[1.5px] border-dashed border-elevated bg-surface p-6 items-center">
            <MaterialCommunityIcons name="pill" size={32} color="#472376" />
            <Text className="mt-3 text-center font-plein-medium text-base text-text-primary">
              No medications yet
            </Text>
            <Text className="mt-1 text-center font-plein text-sm text-text-muted">
              Tap the + button to add your first medication.
            </Text>
          </View>
        )}

        {/* Active + Past */}
        {!loading && !error && meds.length > 0 && (
          <>
            <View className="mb-6 px-6">
              <Text className="mb-3 font-plein-medium text-sm uppercase tracking-wider text-text-muted">
                Active
              </Text>
              {activeMeds.length > 0 ? (
                activeMeds.map((med) => renderMedicationCard(med, false))
              ) : (
                <Text className="font-plein text-sm text-text-muted">
                  No active medications.
                </Text>
              )}
            </View>

            {pastMeds.length > 0 && (
              <View className="px-6">
                <Text className="mb-3 font-plein-medium text-sm uppercase tracking-wider text-text-muted">
                  Past
                </Text>
                {pastMeds.map((med) => renderMedicationCard(med, true))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}