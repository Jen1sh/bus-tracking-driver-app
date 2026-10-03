import { FONTS } from '@/assets/fonts';
import StyledToastManager from '@/components/styled/StyledToastManager';
import { AuthProvider, useAuthContext } from '@/contexts/auth.context';
import useNavigationTheme from '@/hooks/useNavigationTheme';
import { LOCATION_TASK, requestLocationPermission } from '@/lib/location';
import { handleDriverQueryError } from '@/lib/query-error-handler';
import { postLocation } from '@/services/trip.service';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { LocationObject } from 'expo-location';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as TaskManager from 'expo-task-manager';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

type LocationTaskData = { locations: LocationObject[] };

/**
 * The background half of tracking: a native callback that runs whether or not the app is on screen.
 *
 * Registered here, at the entry point, rather than beside `startLocationTracking` in `@/lib/location`.
 * The OS hands a fix to a task by waking a JS context that evaluates the app's main bundle — on Android
 * via `HeadlessJsTaskContext.startTask`, whose own task body is an empty `async () => {}` that only
 * keeps timers alive. Everything this registry contains is populated as a side effect of evaluating
 * that bundle, so a task body defined in a module nothing reaches at startup is simply absent when the
 * OS calls it, and the symptom is silence with no error anywhere.
 *
 * This reports; it does not decide. Starting and stopping live in `@/lib/location`, so there is still
 * only one place that owns the stream's lifecycle.
 */
TaskManager.defineTask<LocationTaskData>(LOCATION_TASK, async ({ data, error }) => {
  if (error || !data?.locations?.length) {
    if (error) {
      console.warn('[location] task error', error);
    }

    return;
  }

  // Only the newest fix. Posting the whole batch means a burst of N rows and N WebSocket broadcasts for
  // samples that are all stale by the time they land — and the parent's trail is a line, not an audit log.
  const fix = data.locations[data.locations.length - 1];

  console.log('[location] task fix', {
    latitude: fix.coords.latitude,
    longitude: fix.coords.longitude,
    speed: fix.coords.speed,
    accuracy: fix.coords.accuracy,
    timestamp: new Date(fix.timestamp).toISOString(),
  });

  try {
    await postLocation({
      latitude: fix.coords.latitude,
      longitude: fix.coords.longitude,
      // Metres per second. Null when the platform could not derive it, which the server accepts.
      speed: fix.coords.speed ?? undefined,
    });
  } catch (err) {
    // Logged rather than swallowed. The earlier version discarded anything non-fatal with no output,
    // which made "the OS stopped delivering fixes" and "every POST is being rejected" indistinguishable
    // from the outside.
    console.warn('[location] post failed', err);
  }
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// A 403 DRIVER_NOT_ASSIGNED is terminal for the session — the driver record is missing, ON_LEAVE or
// INACTIVE, and no retry can change it — so it is handled globally rather than per query. Mutations
// alert at their own call site where the copy can be specific to the action.
const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleDriverQueryError }),
  defaultOptions: {
    queries: {
      // A 4xx will not fix itself. A network blip still gets one retry before the screen's empty
      // state takes over.
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;

        return status && status < 500 ? false : failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts(FONTS);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <AuthProvider>
              <StatusBar style='auto' />
              <RootLayoutNav />
              <StyledToastManager />
            </AuthProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const theme = useNavigationTheme();
  const { token } = useAuthContext();

  // Ask as soon as there is a session, which covers signing in *and* every relaunch of an app that
  // already had a token. Repeating it is harmless by design: the OS prompts only the first time, and
  // afterwards the call just resolves to the standing decision.
  useEffect(() => {
    if (token) {
      void requestLocationPermission();
    }
  }, [token]);

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Public Routes */}
        <Stack.Protected guard={!token}>
          <Stack.Screen name='sign-in' />
        </Stack.Protected>

        {/* Protected Routes */}
        <Stack.Protected guard={!!token}>
          <Stack.Screen name='(protected)' />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
