import { describeDriverError } from '@/lib/driver-errors';
import { Alert } from 'react-native';

let forceLogout: (() => void) | null = null;

/**
 * Registered by `AuthProvider`, mirroring the existing `setLogoutCallback` convention in the axios
 * layer. Held at module level because the `QueryClient` is constructed above the React tree, so it has
 * no access to context.
 */
export const setDriverQueryLogout = (cb: (() => void) | null) => {
  forceLogout = cb;
};

/**
 * Global `QueryCache.onError` for queries.
 *
 * React Query v5 dropped `onError` from `useQuery` options, so query-level user-facing error handling
 * cannot live in the hook. It lives here instead, which also means it cannot be forgotten at a call
 * site — a driver who is ON_LEAVE gets signed out wherever the failure surfaces.
 *
 * Unrecognised codes are deliberately silent: a plain network failure already renders the screen's own
 * empty state, and alerting as well would report the same problem twice.
 */
export const handleDriverQueryError = (error: unknown) => {
  const { title, message, terminal } = describeDriverError(error);

  if (terminal) {
    void forceLogout?.();
    Alert.alert(title, message);

    return;
  }

  if (message) {
    Alert.alert(title, message);
  }
};
