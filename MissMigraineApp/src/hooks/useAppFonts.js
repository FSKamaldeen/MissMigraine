import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'ReemKufi-Bold': require('../assets/fonts/ReemKufi-Bold.ttf'),
    'Plein-Regular': require('../assets/fonts/Plein-Regular.otf'),
    'Plein-Medium':  require('../assets/fonts/Plein-Medium.otf'),
    'Plein-Light':   require('../assets/fonts/Plein-Light.otf'),
  });
}