import { ConfigContext, ExpoConfig } from '@expo/config';

const isDevVariant = process.env.APP_VARIANT === 'development';

function getApplicatioName() {
  if (isDevVariant) {
    return 'RN Template (Dev)';
  }
  return 'RN Template';
}

function getBundlerIdentifier() {
  if (isDevVariant) {
    return 'com.wdftech.rnmt.dev';
  }
  return 'com.wdftech.rnmt';
}

export default (context: ConfigContext): ExpoConfig => ({
  ...context,
  name: getApplicatioName(),
  slug: 'react-native-managed-template',
  scheme: 'rnmt',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icons/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: false,
    bundleIdentifier: getBundlerIdentifier(),
  },
  android: {
    package: getBundlerIdentifier(),
    adaptiveIcon: {
      foregroundImage: './assets/icons/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  plugins: [
    'expo-font',
    'expo-router',
    'expo-secure-store',
    'react-native-edge-to-edge',
    [
      'expo-splash-screen',
      {
        imageWidth: 200,
        backgroundColor: '#f7f7f7',
        image: './assets/icons/splash-icon.png',
        dark: {
          imageWidth: 200,
          backgroundColor: '#f7f7f7',
          image: './assets/icons/splash-icon.png',
        },
      },
    ],
    [
      'expo-dev-client',
      {
        launchMode: 'most-recent',
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
