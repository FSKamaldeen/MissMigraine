import React, { useState, useEffect } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Inline hook — fetch the next scheduled medication
// ─────────────────────────────────────────────────────

function useNextDose() {
  const [nextDose, setNextDose] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchNextDose = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setLoading(false);
          return;
        }

        // 1. Get all active medications for this user
        const { data: meds, error: medsError } = await supabase
          .from('medications')
          .select('id, name, dosage, frequency, type, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (cancelled) return;
        if (medsError) throw medsError;

        if (!meds || meds.length === 0) {
          setNextDose(null);
          return;
        }

        // Check medication reminder
        const scheduled = meds.find(
          (m) => m.frequency && m.frequency.toLowerCase() !== 'as needed'
        );

        if (!scheduled) {
          setNextDose(null);
          return;
        }

        // Fetch the user's medication reminder settings
        const { data: notif } = await supabase
          .from('notification_settings')
          .select('reminder_medication_time, reminder_medication_enabled')
          .eq('user_id', user.id)
          .maybeSingle();

        if (notif?.reminder_medication_enabled && notif.reminder_medication_time) {
          // reminder_medication_time is stored as "HH:MM:SS" (TIME column)
          const [h, m] = notif.reminder_medication_time.split(':').map(Number);
          const now = new Date();
          const next = new Date();
          next.setHours(h, m, 0, 0);
          
          if (next <= now) {
            next.setDate(next.getDate() + 1); // tomorrow
          }
          
          hoursUntil = (next - now) / (1000 * 60 * 60);
        }

        setNextDose({
          name: scheduled.name,
          dosage: scheduled.dosage || '',
          hoursUntil,
        });
      } catch (err) {
        if (cancelled) return;
        console.log('Error fetching next dose:', err);
        setNextDose(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNextDose();

    return () => {
      cancelled = true;
    };
  }, []);

  return { nextDose, loading };
}

// ─────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────

function formatHoursUntil(hours) {
  if (hours == null) return 'Not scheduled';
  if (hours <= 0) return 'Due now';
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `In ${minutes} min`;
  }
  if (hours === 1) return 'In 1 hr';
  if (hours < 24) return `In ${Math.round(hours)} hrs`;
  const days = Math.floor(hours / 24);
  return `In ${days} day${days === 1 ? '' : 's'}`;
}

// ─────────────────────────────────────────────────────
// Main widget
// ─────────────────────────────────────────────────────

export default function MedicationWidget({ onLogMeds, onPressManage }) {
  const { nextDose, loading } = useNextDose();

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="mb-3 flex-row items-center justify-between px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          Medication
        </Text>
      </View>

      {/* The Side-by-Side Cards */}
      <View className="mx-6 flex-row gap-3">
        
        {/* Left Card: Next Dose */}
        <Pressable
          onPress={onLogMeds}
          className="flex-1 rounded-2xl p-5 justify-between bg-surface active:opacity-70 min-h-[140px]"
        >
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-background">
                <MaterialCommunityIcons name="pill" size={16} color="#ad89dc" />
              </View>
              <Text className="font-plein-medium text-lg text-text-primary">
                Next Dose
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color="#ad89dc" style={{ marginTop: 8 }} />
            ) : nextDose ? (
              <>
                <Text className="font-reem text-2xl text-text-primary mt-1">
                  {formatHoursUntil(nextDose.hoursUntil)}
                </Text>
                <Text className="font-plein text-sm text-text-muted mt-1" numberOfLines={1}>
                  {nextDose.name} {nextDose.dosage}
                </Text>
              </>
            ) : (
              <Text className="font-plein text-sm text-text-muted leading-5 mt-2">
                No scheduled medications. Tap to log one manually.
              </Text>
            )}
          </View>
        </Pressable>

        {/* Right Card: Manage Medication */}
        <Pressable 
          onPress={onPressManage}
          className="flex-1 rounded-2xl p-5 justify-between bg-surface active:opacity-70 min-h-[140px]"
        >
          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-background">
                <MaterialCommunityIcons name="arrow-right" size={16} color="#c8b0e8" />
              </View>
              <Text className="font-plein-medium text-lg text-text-primary">
                Manage
              </Text>
            </View>
            
            <Text className="font-plein text-sm text-text-muted leading-5 mt-1">
              Manage all your medications.
            </Text>
          </View>
        </Pressable>

      </View>
    </View>
  );
}