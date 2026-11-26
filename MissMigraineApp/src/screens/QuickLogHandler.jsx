import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function QuickLogHandler({ navigation }) {
  useEffect(() => {
    const confirmLog = async () => {
      Alert.alert(
        'Severe Migraine?',
        'Confirm you are experiencing a severe attack right now. This will log an ongoing migraine with auto-filled data.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Confirm',
            onPress: async () => {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase.from('migraine_logs').insert({
                user_id: user.id,
                logged_at: new Date().toISOString(),
                start_time: new Date().toISOString(),
                intensity: 7, // severe threshold
                still_ongoing: true,
              });

              if (error) {
                Alert.alert('Error', 'Could not log the migraine.');
                return;
              }

              Alert.alert('Logged', 'Your ongoing migraine has been recorded.');
              navigation.goBack();
            },
          },
        ]
      );
    };

    confirmLog();
  }, [navigation]);

  return null;
}