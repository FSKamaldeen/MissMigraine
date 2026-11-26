import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../../lib/supabase';

// Inline components

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

function MenuItem({ icon, label, onPress, variant = 'default', showChevron = true }) {
  const isDanger = variant === 'danger';
  const iconColor = isDanger ? '#a01717' : '#ad89dc';
  const labelColor = isDanger ? 'text-danger' : 'text-text-primary';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 px-5 py-4 active:opacity-60"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-elevated">
        <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
      </View>

      <Text className={`flex-1 font-plein-medium text-base ${labelColor}`}>
        {label}
      </Text>

      {showChevron && (
        <MaterialCommunityIcons name="chevron-right" size={20} color={iconColor} />
      )}
    </Pressable>
  );
}

function Divider() {
  return <View className="mx-5 h-[1px] bg-elevated" />;
}

// Main screen

export default function MoreScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert('Log out', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert('Error', 'Could not log out. Please try again.');
            return;
          }
          navigation.getParent()?.getParent()?.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'Miss Migraine',
      'Version 1.0.0\n\nA migraine tracking and personalized care app for women.',
      [{ text: 'OK' }]
    );
  };

  const handleReports = () => {
    navigation.navigate('Reports');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <Text
            className="font-reem text-4xl text-text-primary"
            style={{ lineHeight: 48 }}
          >
            More
          </Text>
          <Text className="mt-1 font-plein text-base text-text-muted">
            Settings, sharing, and account
          </Text>
        </View>

        {/* Account */}
        <Section title="Account">
          <MenuItem
            icon="account-cog-outline"
            label="Manage account"
            onPress={() => navigation.navigate('ManageAccount')}
          />
          <Divider />
          <MenuItem
            icon="bell-outline"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <Divider />
          <MenuItem
            icon="account-group-outline"
            label="Shared access"
            onPress={() => navigation.navigate('SharingPermissions')}
          />
        </Section>

        {/* Reports */}
        <Section title="Reports">
          <MenuItem
            icon="file-document-outline"
            label="Generate report"
            onPress={handleReports}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <MenuItem
            icon="information-outline"
            label="About Miss Migraine"
            onPress={handleAbout}
          />
        </Section>

        {/* Log out */}
        <Section title="Session">
          <MenuItem
            icon="logout"
            label="Log out"
            onPress={handleLogout}
            variant="danger"
            showChevron={false}
          />
        </Section>

        {/* Footer */}
        <Text className="text-center font-plein text-sm text-text-muted">
          Miss Migraine · Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}