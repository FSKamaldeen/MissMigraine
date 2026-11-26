import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCycleData } from '../../../hooks/useCycleData';
import { useMigraineLogs } from '../../../hooks/useMigraineLogs';
import { supabase } from '../../../lib/supabase';

import GreetingHeader from './components/GreetingHeader';
import WeeklyStats from './components/WeeklyStats';
import CycleCard from './components/CycleCard';
import MedicationWidget from './components/MedicationCard';
import EducationPreview from './components/EducationPreview';

export default function HomeScreen({ navigation }) {
  const { cycleSummary } = useCycleData();
  const { logs } = useMigraineLogs();

  const [preferredName, setPreferredName] = useState(null);
  const [nameLoading, setNameLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadName() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setPreferredName('Error');
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('preferred_name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('HOME NAME LOAD ERROR:', error);
          if (!cancelled) setPreferredName('Error');
          return;
        }

        if (!cancelled) {
          setPreferredName(data?.preferred_name || 'Error');
        }
      } catch (err) {
        console.error('HOME NAME LOAD ERROR:', err);
        if (!cancelled) setPreferredName('Error');
      } finally {
        if (!cancelled) setNameLoading(false);
      }
    }

    loadName();
    return () => { cancelled = true; };
  }, []);

  const handleOpenCycle = useCallback(() => {
    navigation.navigate('CycleTracker');
  }, [navigation]);

  const handlePressManage = () => {
    navigation.navigate('MedicationsList');
  };

  const handleLogMeds = () => {
    navigation.navigate('MedicationsList');
  };

  const handleRateEffectiveness = () => {
    console.log('Open Effectiveness Rating');
  };

  const handleViewAllArticles = useCallback(() => {
    navigation.navigate('EducationalContent');
  }, [navigation]);

  const handleArticlePress = useCallback(
    (article) => {
      navigation.navigate('EducationalArticle', { articleId: article.id });
    },
    [navigation]
  );

  if (nameLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#ad89dc" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <GreetingHeader name={preferredName} />

        <WeeklyStats logs={logs} />

        <CycleCard cycleSummary={cycleSummary} onPress={handleOpenCycle} />

        <MedicationWidget
          onPressManage={handlePressManage}
          onLogMeds={handleLogMeds}
          onRateEffectiveness={handleRateEffectiveness}
        />

        <EducationPreview
          onViewAll={handleViewAllArticles}
          onArticlePress={handleArticlePress}
        />
      </ScrollView>
    </SafeAreaView>
  );
}