import React, { useEffect, useState } from 'react';
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

function FormField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
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
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        autoCorrect={false}
        className="h-[54px] rounded-2xl bg-elevated px-5 font-plein text-base text-text-primary"
      />
    </View>
  );
}

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
      Alert.alert('Weak password', `Your new password must include: ${passwordErrors.join(', ')}.`);
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
      console.error('PASSWORD CHANGE ERROR:', err);
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
          <Text className={`font-plein-medium text-base ${
            saving ? 'text-text-muted' : 'text-text-inverse'
          }`}>
            {saving ? 'Updating…' : 'Change password'}
          </Text>
        </Pressable>
      </View>
    </Section>
  );
}

export default function TrustedAccountScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [connections, setConnections] = useState([]);
  const [originalNames, setOriginalNames] = useState({ full: '', preferred: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'You are not signed in.');
          return;
        }

        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('full_name, preferred_name, email')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) throw userError;

        const { data: conns, error: connError } = await supabase.rpc('get_connected_main_users');
        if (connError) throw connError;

        if (!cancelled) {
          const fName = userRow?.full_name || '';
          const pName = userRow?.preferred_name || '';
          setFullName(fName);
          setPreferredName(pName);
          setEmail(userRow?.email || user.email || '');
          setOriginalNames({ full: fName, preferred: pName });
          setConnections(Array.isArray(conns) ? conns : conns ? [conns] : []);
        }
      } catch (err) {
        console.error('ACCOUNT LOAD ERROR:', err);
        Alert.alert('Error', 'Could not load your account data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const hasChanges =
    fullName !== originalNames.full || preferredName !== originalNames.preferred;

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing name', 'Please enter your full name.');
      return;
    }
    if (preferredName.trim().length < 2) {
      Alert.alert('Missing preferred name', 'Please enter the name you go by.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You are not signed in.');
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          preferred_name: preferredName.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setOriginalNames({ full: fullName.trim(), preferred: preferredName.trim() });
      Alert.alert('Saved', 'Your details have been updated.');
    } catch (err) {
      console.error('ACCOUNT SAVE ERROR:', err);
      Alert.alert('Error', 'Could not save your details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveConnection = (connection) => {
    const displayName =
      connection.preferred_name || connection.full_name || 'this person';

    Alert.alert(
      'Leave this connection?',
      `You'll no longer be able to view ${displayName}'s shared data or receive alerts. They can re-invite you later with a new code.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) {
                Alert.alert('Error', 'You are not signed in.');
                return;
              }

              const { error } = await supabase
                .from('shared_access')
                .delete()
                .eq('user_id', connection.main_user_id)
                .eq('trusted_person_id', user.id);

              if (error) throw error;

              const { data: conns } = await supabase.rpc('get_connected_main_users');
              setConnections(Array.isArray(conns) ? conns : conns ? [conns] : []);
              Alert.alert('Connection removed', `You're no longer connected to ${displayName}.`);
            } catch (err) {
              console.error('LEAVE CONNECTION ERROR:', err);
              Alert.alert('Error', 'Could not leave the connection. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete your account. You\'ll lose access to anyone you\'re connected to, and your data will be removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { data, error } = await supabase.functions.invoke('delete-own-account');

              if (error) {
                if (error.context) {
                  const errorBody = await error.context.text();
                  console.error('DELETE ACCOUNT ERROR:', errorBody);
                }
                throw error;
              }
              if (data?.error) throw new Error(data.error);

              // Sign out locally and return to login
              await supabase.auth.signOut().catch(() => {});
              navigation.getParent()?.getParent()?.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              console.error('DELETE ACCOUNT ERROR:', err);
              Alert.alert(
                'Could not delete',
                err.message || 'Something went wrong. Please try again.'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#ad89dc" />
      </SafeAreaView>
    );
  }

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
          <View className="px-6 pt-4 pb-6">
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              className="mb-4 self-start"
            >
              <MaterialCommunityIcons name="arrow-left" size={26} color="#f1ebf9" />
            </Pressable>
            <Text className="font-reem text-4xl text-text-primary">
              Your account
            </Text>
            <Text className="mt-1 font-plein text-base text-text-muted">
              Details and preferences
            </Text>
          </View>

          <Section title="Personal details">
            <FormField
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
            />
            <Divider />
            <FormField
              label="Preferred name"
              value={preferredName}
              onChangeText={setPreferredName}
              placeholder="How you'd like to be addressed"
            />
            <Divider />
            <View className="px-5 py-4">
              <Text className="mb-2 font-plein-medium text-sm text-text-secondary">
                Email
              </Text>
              <View className="h-[54px] justify-center rounded-2xl bg-elevated px-5">
                <Text className="font-plein text-base text-text-muted">{email}</Text>
              </View>
              <Text className="mt-2 font-plein text-xs text-text-muted">
                Email can't be changed from here.
              </Text>
            </View>
          </Section>

          <View className="mx-6 mb-6">
            <Pressable
              onPress={handleSave}
              disabled={saving || !hasChanges}
              className={`items-center rounded-full py-4 ${
                saving || !hasChanges
                  ? 'bg-elevated'
                  : 'bg-brand active:bg-brand-dark'
              }`}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#f1ebf9" />
              ) : (
                <Text className={`font-plein-medium text-base ${
                  hasChanges ? 'text-text-inverse' : 'text-text-muted'
                }`}>
                  {hasChanges ? 'Save changes' : 'No changes'}
                </Text>
              )}
            </Pressable>
          </View>

          <PasswordSection />

          <Section title={`Your connections (${connections.length})`}>
            {connections.length === 0 ? (
              <View className="px-5 py-6 items-center">
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={32}
                  color="#472376"
                />
                <Text className="mt-2 text-center font-plein text-sm text-text-muted">
                  You're not connected to anyone right now.
                </Text>
              </View>
            ) : (
              connections.map((conn, idx) => {
                const displayName =
                  conn.preferred_name || conn.full_name || 'Unnamed';
                return (
                  <View key={conn.main_user_id}>
                    {idx > 0 && <Divider />}
                    <View className="flex-row items-center justify-between px-5 py-4">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-brand/20">
                          <Text className="font-plein-medium text-sm text-brand-light">
                            {displayName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-plein-medium text-base text-text-primary">
                            {displayName}
                          </Text>
                          <Text className="font-plein text-xs text-text-muted mt-0.5 capitalize">
                            {(conn.access_level || 'full').replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleLeaveConnection(conn)}
                        hitSlop={10}
                        className="px-3 py-1.5 rounded-full bg-danger/15 active:opacity-70"
                      >
                        <Text className="font-plein-medium text-xs text-danger">
                          Leave
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </Section>

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
                This permanently removes your trusted person account and all your data. You'll lose access to anyone you're connected to. This cannot be undone.
              </Text>
              <Pressable
                onPress={handleDeleteAccount}
                disabled={deleting}
                className={`items-center rounded-full py-4 active:opacity-80 ${
                  deleting ? 'bg-danger/50' : 'bg-danger'
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