import { FONTS } from '@/assets/fonts';
import StyledToastManager from '@/components/styled/StyledToastManager';
import { AuthProvider, useAuthContext } from '@/contexts/auth.context';
import useNavigationTheme from '@/hooks/useNavigationTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export { ErrorBoundary } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
