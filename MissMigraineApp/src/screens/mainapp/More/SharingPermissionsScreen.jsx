import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { supabase } from '../../../lib/supabase';

// ─────────────────────────────────────────────────────
// Access levels
// ─────────────────────────────────────────────────────

const SHARING_ACCESS_LEVELS = [
  {
    key: 'full',
    label: 'Full access',
    description: 'Can see all logs, cycle data, and insights.',
  },
  {
    key: 'limited',
    label: 'Limited access',
    description: 'Can see summary insights only.',
  },
  {
    key: 'emergency_only',
    label: 'Emergency only',
    description: 'Only sees severe migraine alerts.',
  },
];

function getPermissionsForAccessLevel(levelKey) {
  if (levelKey === 'full') {
    return { view_logs: true, view_cycle: true, view_insights: true, receive_alerts: true };
  }
  if (levelKey === 'limited') {
    return { view_logs: false, view_cycle: false, view_insights: true, receive_alerts: true };
  }
  return { view_logs: false, view_cycle: false, view_insights: false, receive_alerts: true };
}

// ─────────────────────────────────────────────────────
// Inline components
// ─────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <View className="mb-6">
      {title && (
        <View className="mb-3 px-6">
          <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
            {title}
          </Text>
        </View>
      )}
      <View className="mx-6 rounded-[24px] bg-surface overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="mx-5 h-[1px] bg-elevated" />;
}

// ─────────────────────────────────────────────────────
// Sharing Code Card
// ─────────────────────────────────────────────────────

function SharingCodeCard({ code, onCopy }) {
  const [isVisible, setIsVisible] = useState(false);
  const displayCode = isVisible && code ? code : '••••-••••-••••';

  return (
    <Section title="Your sharing code">
      <View className="px-5 py-6">
        <View className="flex-row items-center justify-between rounded-2xl bg-elevated px-5 py-4">
          <Text
            className="font-reem text-2xl text-text-primary"
            style={{ letterSpacing: 2 }}
          >
            {displayCode}
          </Text>
          <Pressable
            onPress={() => setIsVisible((prev) => !prev)}
            hitSlop={10}
            className="p-2"
          >
            <MaterialCommunityIcons
              name={isVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#ad89dc"
            />
          </Pressable>
        </View>

        <Pressable
          onPress={onCopy}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-full bg-brand py-4 active:bg-brand-dark"
        >
          <MaterialCommunityIcons name="content-copy" size={18} color="#11081b" />
          <Text className="font-plein-medium text-base text-text-inverse">
            Copy code
          </Text>
        </Pressable>

        <Text className="mt-4 text-center font-plein text-sm text-text-muted">
          Share this code with someone you trust. They'll use it when creating their account.
        </Text>
      </View>
    </Section>
  );
}

// ─────────────────────────────────────────────────────
// Trusted Person Card
// ─────────────────────────────────────────────────────

function TrustedPersonCard({ person, onModify, onRevoke }) {
  const accessLevel = SHARING_ACCESS_LEVELS.find(
    (l) => l.key === person.access_level
  );
  const isActive = person.is_active !== false;

  return (
    <View className="px-5 py-4">
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-plein-medium text-base text-text-primary">
            {person.full_name || 'Trusted person'}
          </Text>
          <Text className="mt-1 font-plein text-sm text-text-muted">
            {person.email}
          </Text>
        </View>
        <View
          className={`rounded-full px-2.5 py-1 ${
            isActive ? 'bg-brand-dark/40' : 'bg-elevated'
          }`}
        >
          <Text
            className={`font-plein-medium text-xs ${
              isActive ? 'text-brand-light' : 'text-text-muted'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <Text className="mb-4 font-plein text-sm text-text-secondary">
        {accessLevel?.label || 'Limited access'}
      </Text>

      {isActive && (
        <View className="flex-row gap-2">
          <Pressable
            onPress={onModify}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-elevated py-3 active:opacity-70"
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#c8b0e8" />
            <Text className="font-plein-medium text-sm text-text-secondary">Modify</Text>
          </Pressable>
          <Pressable
            onPress={onRevoke}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-danger/15 py-3 active:opacity-70"
          >
            <MaterialCommunityIcons name="account-remove-outline" size={16} color="#a01717" />
            <Text className="font-plein-medium text-sm text-danger">Revoke</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────
// Modify Access Modal
// ─────────────────────────────────────────────────────

function ModifyAccessModal({ visible, person, onClose, onSave, saving }) {
  const [accessLevelKey, setAccessLevelKey] = useState(
    person?.access_level || 'limited'
  );

  useEffect(() => {
    if (person) setAccessLevelKey(person.access_level);
  }, [person]);

  if (!person) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="rounded-t-3xl bg-surface px-6 pt-6 pb-10">
          <Text className="mb-1 font-reem text-2xl text-text-primary">
            Modify access
          </Text>
          <Text className="mb-6 font-plein text-sm text-text-muted">
            {person.full_name || person.email}
          </Text>

          <Text className="mb-3 font-reem text-xs uppercase tracking-wider text-text-muted">
            Access level
          </Text>

          <View className="gap-3">
            {SHARING_ACCESS_LEVELS.map((level) => {
              const isActive = accessLevelKey === level.key;
              return (
                <Pressable
                  key={level.key}
                  onPress={() => setAccessLevelKey(level.key)}
                  className={`flex-row items-start gap-3 rounded-2xl border-[1.5px] p-4 active:opacity-80 ${
                    isActive
                      ? 'border-brand bg-brand/15'
                      : 'border-elevated bg-elevated'
                  }`}
                >
                  <View
                    className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border-[1.5px] ${
                      isActive ? 'border-brand bg-brand' : 'border-text-muted bg-transparent'
                    }`}
                  >
                    {isActive && (
                      <MaterialCommunityIcons name="check" size={12} color="#11081b" />
                    )}
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`font-plein-medium text-base ${
                        isActive ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {level.label}
                    </Text>
                    <Text
                      className={`mt-1 font-plein text-sm leading-5 ${
                        isActive ? 'text-text-secondary' : 'text-text-muted'
                      }`}
                    >
                      {level.description}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-6 gap-3">
            <Pressable
              onPress={() => onSave({ accessLevelKey })}
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
            <Pressable
              onPress={onClose}
              disabled={saving}
              className="items-center rounded-full bg-elevated py-4 active:opacity-70"
            >
              <Text className="font-plein-medium text-base text-text-secondary">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────

export default function SharingPermissionsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [sharingCode, setSharingCode] = useState(null);
  const [trustedPersons, setTrustedPersons] = useState([]);
  const [userId, setUserId] = useState(null);

  const [modifyPersonId, setModifyPersonId] = useState(null);
  const [modifySaving, setModifySaving] = useState(false);

  const modifyPerson = trustedPersons.find((p) => p.trusted_person_id === modifyPersonId);

  // ─── Load data ─────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You are not signed in.');
        navigation.goBack();
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('trusted_code')
        .eq('user_id', user.id)
        .maybeSingle();

      setSharingCode(profile?.trusted_code || null);

      const { data: accessRows, error: accessError } = await supabase
        .from('shared_access')
        .select(`
          id,
          trusted_person_id,
          access_level,
          is_active,
          access_granted_at,
          users:trusted_person_id ( full_name, email, preferred_name )
        `)
        .eq('user_id', user.id)
        .order('access_granted_at', { ascending: false });

      if (accessError) throw accessError;

      const flattened = (accessRows || []).map((row) => ({
        access_id: row.id,
        trusted_person_id: row.trusted_person_id,
        access_level: row.access_level,
        is_active: row.is_active,
        full_name: row.users?.full_name || null,
        email: row.users?.email || null,
        preferred_name: row.users?.preferred_name || null,
      }));

      setTrustedPersons(flattened);
    } catch (err) {
      console.log('Error loading shared access:', err);
      Alert.alert('Error', 'Could not load your sharing settings.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    load();
  }, [load]);

  // ─── Copy code ─────────────────────────────────────
  const handleCopyCode = async () => {
    if (!sharingCode) return;
    try {
      await Clipboard.setStringAsync(sharingCode);
      Alert.alert('Copied', 'Sharing code copied to clipboard.');
    } catch {
      Alert.alert('Copy failed', 'Please copy the code manually.');
    }
  };

  // ─── Modify access level ───────────────────────────
  const handleSaveAccess = async ({ accessLevelKey }) => {
    if (!modifyPerson) return;

    try {
      setModifySaving(true);

      const { error } = await supabase
        .from('shared_access')
        .update({
          access_level: accessLevelKey,
          permissions: getPermissionsForAccessLevel(accessLevelKey),
          updated_at: new Date().toISOString(),
        })
        .eq('id', modifyPerson.access_id);

      if (error) throw error;

      setModifyPersonId(null);
      Alert.alert('Saved', 'Access level updated.');
      await load();
    } catch (err) {
      console.log('Error updating access level:', err);
      Alert.alert('Error', 'Could not update access level.');
    } finally {
      setModifySaving(false);
    }
  };

  // ─── Revoke access ─────────────────────────────────
  const handleRevoke = (person) => {
    Alert.alert(
      'Revoke access?',
      `${person.full_name || person.email} will no longer be able to view your data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('shared_access')
                .update({
                  is_active: false,
                  access_revoked_at: new Date().toISOString(),
                })
                .eq('id', person.access_id);

              if (error) throw error;

              await load();
            } catch (err) {
              console.log('Error revoking access:', err);
              Alert.alert('Error', 'Could not revoke access.');
            }
          },
        },
      ]
    );
  };

  // ─── Loading ───────────────────────────────────────
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
          <Text className="mt-4 font-plein text-sm text-text-muted">Loading sharing settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ────────────────────────────────────────
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} className="mb-4 self-start">
            <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
          </Pressable>
          <Text className="font-reem text-4xl text-text-primary">Shared access</Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            People who can view your data
          </Text>
        </View>

        {/* Sharing code */}
        {sharingCode ? (
          <SharingCodeCard code={sharingCode} onCopy={handleCopyCode} />
        ) : (
          <Section title="Your sharing code">
            <View className="px-5 py-6 items-center">
              <Text className="text-center font-plein text-sm text-text-muted">
                No sharing code found. Try restarting the app or contact support.
              </Text>
            </View>
          </Section>
        )}

        {/* Trusted persons */}
        <Section title="Trusted persons">
          {trustedPersons.length === 0 ? (
            <View className="items-center py-10 px-6">
              <MaterialCommunityIcons name="account-off-outline" size={40} color="#472376" />
              <Text className="mt-3 font-plein-medium text-base text-text-primary">
                No trusted persons yet
              </Text>
              <Text className="mt-1 text-center font-plein text-sm text-text-muted">
                Share your code with someone you trust. Once they sign up, they'll appear here.
              </Text>
            </View>
          ) : (
            trustedPersons.map((person, idx) => (
              <React.Fragment key={person.access_id}>
                {idx > 0 && <Divider />}
                <TrustedPersonCard
                  person={person}
                  onModify={() => setModifyPersonId(person.trusted_person_id)}
                  onRevoke={() => handleRevoke(person)}
                />
              </React.Fragment>
            ))
          )}
        </Section>

        {/* Privacy note */}
        <View className="mx-6 mt-2 rounded-[24px] bg-surface p-5">
          <View className="mb-2 flex-row items-center gap-2">
            <MaterialCommunityIcons name="shield-lock-outline" size={16} color="#ad89dc" />
            <Text className="font-reem text-xs uppercase tracking-wider text-text-muted">
              Privacy
            </Text>
          </View>
          <Text className="font-plein text-sm leading-6 text-text-muted">
            Trusted persons can view your data but can't edit it. You can change or revoke their access at any time.
          </Text>
        </View>
      </ScrollView>

      <ModifyAccessModal
        visible={Boolean(modifyPersonId)}
        person={modifyPerson}
        onClose={() => setModifyPersonId(null)}
        onSave={handleSaveAccess}
        saving={modifySaving}
      />
    </SafeAreaView>
  );
}