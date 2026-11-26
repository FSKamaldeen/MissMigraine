const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'lottie',
];

try {
  const packedMap = require('@expo/metro-config/build/serializer/packedMap');
  if (packedMap && typeof packedMap.patchBundlerPrototypeForPackedMaps === 'function') {
    packedMap.patchBundlerPrototypeForPackedMaps();
  }
} catch (e) {
  // Patch not available in this version — safe to ignore
}

module.exports = withNativeWind(config, { input: './global.css' });
