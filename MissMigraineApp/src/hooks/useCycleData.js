import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_OVULATION_DAY = 14;
const DEFAULT_PERIOD_DURATION_DAYS = 7;

export function useCycleData() {
  const [cycleData, setCycleData] = useState(null);
  const [cycleHistory, setCycleHistory] = useState([]);
  const [phaseOverrides, setPhaseOverrides] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCycleData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('cycle_length_avg')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: entries } = await supabase
        .from('cycle_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('period_start', { ascending: false });

      const cycleLength = profile?.cycle_length_avg || DEFAULT_CYCLE_LENGTH;
      const latestEntry = entries && entries.length > 0 ? entries[0] : null;

      if (latestEntry) {
        setCycleData({
          lastPeriodStartDate: latestEntry.period_start,
          lastPeriodEndDate: latestEntry.period_end || '',
          averageCycleLength: cycleLength.toString(),
          ovulationDay: (latestEntry.ovulation_day || DEFAULT_OVULATION_DAY).toString(),
          notes: latestEntry.notes || '',
        });
        setCycleHistory(entries);
      } else {
        setCycleData(null);
      }
    } catch (err) {
      console.log('Error fetching cycle data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCycleData();
  }, [fetchCycleData]);

  const saveCycleData = async (nextCycleData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      await supabase
        .from('user_profiles')
        .update({ cycle_length_avg: parseInt(nextCycleData.averageCycleLength, 10) })
        .eq('user_id', user.id);

      // Use the end date the user provided, or fall back to a 7-day default
      let periodEnd = nextCycleData.lastPeriodEndDate;
      if (!periodEnd && nextCycleData.lastPeriodStartDate) {
        const start = new Date(nextCycleData.lastPeriodStartDate);
        start.setDate(start.getDate() + DEFAULT_PERIOD_DURATION_DAYS - 1);
        periodEnd = start.toISOString().split('T')[0];
      }

      const { data: existing } = await supabase
        .from('cycle_entries')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      let error;
      if (existing) {
        const { error: updateErr } = await supabase
          .from('cycle_entries')
          .update({
            period_start: nextCycleData.lastPeriodStartDate,
            period_end: periodEnd,
            cycle_length: parseInt(nextCycleData.averageCycleLength, 10),
            ovulation_day: parseInt(nextCycleData.ovulationDay, 10),
            notes: nextCycleData.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from('cycle_entries')
          .insert({
            user_id: user.id,
            period_start: nextCycleData.lastPeriodStartDate,
            period_end: periodEnd,
            cycle_length: parseInt(nextCycleData.averageCycleLength, 10),
            ovulation_day: parseInt(nextCycleData.ovulationDay, 10),
            notes: nextCycleData.notes,
          });
        error = insertErr;
      }

      if (error) throw error;

      setCycleData({ ...nextCycleData, lastPeriodEndDate: periodEnd });
      await fetchCycleData();
      return { success: true };
    } catch (err) {
      console.log('Error saving cycle data:', err);
      return { success: false, error: err };
    }
  };

  const getSummaryForDate = useCallback((targetDate) => {
    if (!cycleData || !cycleData.lastPeriodStartDate) return null;

    const start = new Date(cycleData.lastPeriodStartDate);
    start.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    const cycleLength = parseInt(cycleData.averageCycleLength, 10) || DEFAULT_CYCLE_LENGTH;
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dayInCycle = (diffDays % cycleLength + cycleLength) % cycleLength + 1;

    // Determine the number of menstrual days from the saved period_end
    let menstrualDays = 7;
    if (cycleData.lastPeriodStartDate && cycleData.lastPeriodEndDate) {
      const s = new Date(cycleData.lastPeriodStartDate);
      const e = new Date(cycleData.lastPeriodEndDate);
      const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > 0 && diff <= 15) menstrualDays = diff;
    }

    let phaseKey = 'follicular';
    if (dayInCycle <= menstrualDays) phaseKey = 'menstrual';
    else if (dayInCycle >= 13 && dayInCycle <= 16) phaseKey = 'ovulatory';
    else if (dayInCycle > 16) phaseKey = 'luteal';

    const segments = [
      { key: 'menstrual', length: menstrualDays },
      { key: 'follicular', length: Math.max(13 - menstrualDays, 3) },
      { key: 'ovulatory', length: 4 },
      { key: 'luteal', length: Math.max(cycleLength - (menstrualDays + (13 - menstrualDays) + 4), 4) },
    ];

    const nextPeriodDate = new Date(start);
    while (nextPeriodDate <= target) {
      nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
    }

    return {
      phaseKey,
      dayInCycle,
      cycleLength,
      nextPeriodDate: nextPeriodDate.toISOString(),
      segments,
    };
  }, [cycleData]);

  const cycleSummary = useMemo(() => getSummaryForDate(new Date()), [getSummaryForDate]);

  return {
    cycleData,
    cycleHistory,
    phaseOverrides,
    cycleSummary,
    loading,
    getSummaryForDate,
    saveCycleData,
  };
}