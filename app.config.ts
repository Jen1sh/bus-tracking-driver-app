import { ConfigContext, ExpoConfig } from '@expo/config';

const isDevVariant = process.env.APP_VARIANT === 'development';

function getApplicatioName() {
  if (isDevVariant) {
    return 'Bus Tracking Driver (Dev)';
  }
  return 'Bus Tracking Driver';
}

function getBundlerIdentifier() {
  if (isDevVariant) {
    return 'com.snb.bustracking.driver.dev';
  }
  return 'com.snb.bustracking.driver';
}

export default (context: ConfigContext): ExpoConfig => ({
  ...context,
  name: getApplicatioName(),
  slug: 'bus-tracking-driver',
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
    // expo-location adds the location and foreground-service permissions but not this one, so Android
    // 13+ silently refuses to display the foreground-service notification the tracking stream depends
    // on. The practical effect is that a driver gets no indication their location is being shared — and
    // on some OEM builds the service is reclaimed when its notification cannot be shown. Declaring it is
    // enough: the system raises its own prompt the first time the service posts to its channel.
    permissions: ['android.permission.POST_NOTIFICATIONS'],
  },
  plugins: [
    // Must stay first: it has to write android/local.properties before anything reads the SDK path.
    // Referenced by path rather than imported — ExpoConfig.plugins only accepts string plugin
    // specifiers, and passing the function directly type-errors *and* silently does nothing.
    './plugins/with-android-sdk-location',
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
        // Both prompts get real copy. Only the "Always" string was set before, so iOS fell back to
        // Expo's generic "Allow $(PRODUCT_NAME) to access your location" for the when-in-use prompt —
        // and that is the one the driver actually sees first.
        locationWhenInUsePermission:
          'Allow $(PRODUCT_NAME) to use your location to share your bus position with the school.',
        locationAlwaysAndWhenInUsePermission:
          'Allow $(PRODUCT_NAME) to use your location in the background, so the school can follow the bus while the app is closed.',
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        // Defaults to isAndroidBackgroundLocationEnabled, but stated so the foreground-service
        // permissions the notification depends on are not lost if background is ever turned off.
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    "expo-background-task",
    "expo-status-bar"
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'a4f589d4-b046-44f1-9233-b144ccc9d446',
    },
  },
});
