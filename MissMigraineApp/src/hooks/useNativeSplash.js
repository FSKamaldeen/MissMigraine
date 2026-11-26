import { useEffect, useState } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore — happens if this runs twice in dev mode */
});

/**
 * @param {boolean} appReady - true once fonts/assets are loaded
 * @returns {{ nativeSplashHidden: boolean }}
 */
export function useNativeSplash(appReady) {
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);

  useEffect(() => {
    if (!appReady) return;

    ExpoSplashScreen.hideAsync()
      .catch(() => {
        /* ignore — hide can throw if called twice */
      })
      .finally(() => {
        setNativeSplashHidden(true);
      });
  }, [appReady]);

  return { nativeSplashHidden };
}