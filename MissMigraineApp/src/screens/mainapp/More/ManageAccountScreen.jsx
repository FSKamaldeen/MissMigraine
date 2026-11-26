import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../../lib/supabase';
import { MENSTRUAL_STATUS_OPTIONS } from '../../../constants/cyclePhases';

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <View className="mb-6">
      <View className="mb-3 px-6">
        <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
          {title}
        </Text>
      </View>
      <View className="mx-6 rounded-[24px] bg-surface overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="mx-5 h-[1px] bg-elevated" />;
}

function FormField({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  secureTextEntry,
  editable = true,
}) {
  return (
    <View className="px-5 py-4">
      <Text className="mb-2 font-plein-medium text-sm text-text-secondary">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#c8b0e8"
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        editable={editable}
        className={`h-[54px] rounded-2xl bg-elevated px-5 font-plein text-base ${
          editable ? 'text-text-primary' : 'text-text-muted'
        }`}
      />
    </View>
  );
}

function ChoiceRow({ label, options, value, onChange }) {
  return (
    <View className="px-5 py-4">
      <Text className="mb-3 font-plein-medium text-sm text-text-secondary">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              className={`rounded-full px-4 py-2.5 active:opacity-70 ${
                isActive ? 'bg-brand' : 'bg-elevated'
              }`}
            >
              <Text
                className={`font-plein-medium text-sm ${
                  isActive ? 'text-text-inverse' : 'text-text-secondary'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function IntensityPicker({ value, onChange }) {
  return (
    <View className="px-5 py-4">
      <Text className="mb-3 font-plein-medium text-sm text-text-secondary">
        Average intensity
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
          const isActive = value === num;
          return (
            <Pressable
              key={num}
              onPress={() => onChange(num)}
              className={`h-10 w-10 items-center justify-center rounded-full active:opacity-70 ${
                isActive ? 'bg-brand' : 'bg-elevated'
              }`}
            >
              <Text
                className={`font-plein-medium text-sm ${
                  isActive ? 'text-text-inverse' : 'text-text-secondary'
                }`}
              >
                {num}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Password section
// ─────────────────────────────────────────────────────

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/\d/.test(password)) errors.push('one number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('one symbol');
    return errors;
  };

  const handleChangePassword = async () => {
    const passwordErrors = validatePassword(newPassword);

    if (!currentPassword) {
      Alert.alert('Missing field', 'Please enter your current password.');
      return;
    }
    if (passwordErrors.length > 0) {
      Alert.alert(
        'Weak password',
        `Your new password must include: ${passwordErrors.join(', ')}.`
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Please make sure both passwords are the same.');
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert('Same password', 'Your new password must be different from your current one.');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        Alert.alert('Error', 'Could not verify your account. Please log in again.');
        return;
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        Alert.alert('Incorrect password', 'Your current password is incorrect.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert('Error', updateError.message || 'Could not update password.');
        return;
      }

      Alert.alert('Password updated', 'Your password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Password">
      <FormField
        label="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        secureTextEntry
      />
      <Divider />
      <FormField
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="At least 8 characters"
        secureTextEntry
      />
      <Divider />
      <FormField
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repeat new password"
        secureTextEntry
      />

      <View className="px-5 py-4">
        <Text className="mb-2 font-plein text-xs text-text-muted">
          Must include: 8+ characters, uppercase, lowercase, number, symbol.
        </Text>
        <Pressable
          onPress={handleChangePassword}
          disabled={saving}
          className={`items-center rounded-full py-4 active:opacity-80 ${
            saving ? 'bg-elevated' : 'bg-brand'
          }`}
        >
          <Text
            className={`font-plein-medium text-base ${
              saving ? 'text-text-muted' : 'text-text-inverse'
            }`}
          >
            {saving ? 'Updating…' : 'Change password'}
          </Text>
        </Pressable>
      </View>
    </Section>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function ManageAccountScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [profile, setProfile] = useState({
    fullName: '',
    preferredName: '',
    email: '',
    menstrualStatus: 'regular',
    cycleLengthAvg: 28,
    auraPresent: false,
    ageOfOnset: '',
    avgFrequency: '',
    avgIntensity: 5,
  });

  const update = (patch) => setProfile((prev) => ({ ...prev, ...patch }));

  // ─── Load profile from Supabase ──────────────────────
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You are not signed in.');
        navigation.goBack();
        return;
      }

      // users table — name, email
      const { data: userRow } = await supabase
        .from('users')
        .select('email, full_name, preferred_name')
        .eq('id', user.id)
        .maybeSingle();

      // user_profiles — migraine-specific
      const { data: profileRow } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile({
        fullName: userRow?.full_name || '',
        preferredName: userRow?.preferred_name || '',
        email: userRow?.email || user.email || '',
        menstrualStatus: profileRow?.cycle_regularity || 'regular',
        cycleLengthAvg: profileRow?.cycle_length_avg ?? 28,
        auraPresent: profileRow?.aura_present ?? false,
        ageOfOnset: profileRow?.age_of_onset ?? '',
        avgFrequency: profileRow?.avg_frequency ?? '',
        avgIntensity: profileRow?.avg_intensity ?? 5,
      });
    } catch (err) {
      console.log('Error loading profile:', err);
      Alert.alert('Error', 'Could not load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── Save profile ────────────────────────────────────
  const handleSave = async () => {
    if (!profile.fullName.trim()) {
      Alert.alert('Missing name', 'Please enter your full name.');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      // Update users.full_name
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: profile.fullName.trim(),
          preferred_name: profile.preferredName.trim() || null,
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Upsert user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: user.id,
            cycle_regularity: profile.menstrualStatus,
            cycle_length_avg: parseInt(profile.cycleLengthAvg, 10) || 28,
            aura_present: profile.auraPresent,
            age_of_onset: parseInt(profile.ageOfOnset, 10) || null,
            avg_frequency: parseInt(profile.avgFrequency, 10) || null,
            avg_intensity: profile.avgIntensity || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (profileError) throw profileError;

      Alert.alert('Saved', 'Your account details were updated.');
    } catch (err) {
      console.log('Error saving profile:', err);
      Alert.alert('Error', err.message || 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete account ──────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all your migraine logs, cycle data, and trusted person access. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await supabase.rpc('delete_own_account');
              if (error) throw error;

              await supabase.auth.signOut().catch(() => {});

              navigation.getParent()?.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              console.log('Delete account error:', err);
              Alert.alert('Error', err.message || 'Could not delete your account.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // ─── Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="px-6 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ad89dc" />
          <Text className="mt-4 font-plein text-sm text-text-muted">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ──────────────────────────────────────────
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-6">
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              className="mb-4 self-start"
            >
              <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
            </Pressable>
            <Text className="font-reem text-4xl text-text-primary">
              Manage account
            </Text>
            <Text className="mt-1 font-plein text-base text-text-muted">
              Personal details and migraine profile
            </Text>
          </View>

          {/* Personal details */}
          <Section title="Personal details">
            <FormField
              label="Full name"
              value={profile.fullName}
              onChangeText={(v) => update({ fullName: v })}
              placeholder="Your name"
            />
            <Divider />
            <FormField
              label="Preferred name"
              value={profile.preferredName}
              onChangeText={(v) => update({ preferredName: v })}
              placeholder="How we should address you"
            />
            <Divider />
            <FormField
              label="Email"
              value={profile.email}
              editable={false}
              placeholder="you@example.com"
            />
          </Section>

          {/* Migraine profile */}
          <Section title="Migraine profile">
            <ChoiceRow
              label="Menstrual status"
              options={MENSTRUAL_STATUS_OPTIONS}
              value={profile.menstrualStatus}
              onChange={(v) => update({ menstrualStatus: v })}
            />
            <Divider />
            <FormField
              label="Average cycle length (days)"
              value={String(profile.cycleLengthAvg)}
              onChangeText={(v) => update({ cycleLengthAvg: v })}
              keyboardType="number-pad"
              placeholder="28"
            />
            <Divider />
            <FormField
              label="Age of onset"
              value={String(profile.ageOfOnset)}
              onChangeText={(v) => update({ ageOfOnset: v })}
              keyboardType="number-pad"
              placeholder="e.g. 17"
            />
            <Divider />
            <FormField
              label="Average migraines per month"
              value={String(profile.avgFrequency)}
              onChangeText={(v) => update({ avgFrequency: v })}
              keyboardType="number-pad"
              placeholder="e.g. 4"
            />
            <Divider />
            <IntensityPicker
              value={profile.avgIntensity}
              onChange={(v) => update({ avgIntensity: v })}
            />
          </Section>

          {/* Save Changes */}
          <View className="mx-6 mb-6">
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className={`items-center rounded-full py-4 active:opacity-80 ${
                saving ? 'bg-elevated' : 'bg-brand'
              }`}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ad89dc" />
              ) : (
                <Text className="font-plein-medium text-base text-text-inverse">
                  Save changes
                </Text>
              )}
            </Pressable>
          </View>

          {/* Password */}
          <PasswordSection />

          {/* Danger zone */}
          <View className="mt-2 mb-6">
            <View className="mb-3 px-6">
              <Text className="font-reem text-xs uppercase tracking-wider text-danger">
                Danger zone
              </Text>
            </View>
            <View className="mx-6 rounded-[24px] bg-danger/10 p-5">
              <Text className="mb-2 font-plein-medium text-base text-text-primary">
                Delete your account
              </Text>
              <Text className="mb-4 font-plein text-sm leading-6 text-text-muted">
                This permanently removes your account and all associated data — migraine logs, cycle data, and any trusted person access. This cannot be undone.
              </Text>
              <Pressable
                onPress={handleDeleteAccount}
                disabled={deleting}
                className={`items-center rounded-full bg-danger py-4 active:opacity-80 ${
                  deleting ? 'opacity-50' : ''
                }`}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#f1ebf9" />
                ) : (
                  <Text className="font-plein-medium text-base text-text-primary">
                    Delete account permanently
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}