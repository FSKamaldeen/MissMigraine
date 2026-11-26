import './global.css';

import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

import RootNavigator from './src/navigation/RootNavigator';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useNativeSplash } from './src/hooks/useNativeSplash';
import { supabase } from './src/lib/supabase';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const [assetsReady, setAssetsReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [authFlowActive, setAuthFlowActive] = useState(false);

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (fontsLoaded) setAssetsReady(true);
  }, [fontsLoaded]);

  useNativeSplash(assetsReady);

  // Fetch the role from public.users
  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('fetchRole error:', error);
        setUserRole('user'); // fallback — assume main user
      } else if (data?.role) {
        setUserRole(data.role);
      } else {
        setUserRole('user');
      }
    } catch (e) {
      console.error('fetchRole exception:', e);
      setUserRole('user');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      setSession(session);
      if (session) {
        await fetchRole(session.user.id);
      } else {
        setUserRole(null);
        setAuthLoading(false);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        setSession(session);
        if (session) {
          await fetchRole(session.user.id);
        } else {
          setUserRole(null);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const onRootLayout = useCallback(async () => {
    if (assetsReady) {
      await ExpoSplashScreen.hideAsync().catch(() => {});
    }
  }, [assetsReady]);


  useEffect(() => {
    const handleUrl = async (url) => {
      if (!url) return;
      if (!url.includes('reset-password')) return;

      const fragment = url.split('#')[1];
      if (!fragment) return;

      const params = new URLSearchParams(fragment);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    };

    // Cold start
    Linking.getInitialURL().then(handleUrl);

    // Warm start
    const sub = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => sub.remove();
  }, []);

  if (!assetsReady || authLoading) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View className="flex-1" onLayout={onRootLayout}>
        <RootNavigator
          splashDone={splashDone}
          onSplashFinish={() => setSplashDone(true)}
          session={session}
          userRole={userRole}
          authFlowActive={authFlowActive}
          setAuthFlowActive={setAuthFlowActive}
        />
      </View>
    </SafeAreaProvider>
  );


}