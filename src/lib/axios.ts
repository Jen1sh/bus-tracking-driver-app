import { StorageKeys } from '@/constants/storage-keys';
import { Urls } from '@/constants/urls';
import { SecureStore } from '@/lib/secure-store';
import axios, { isAxiosError } from 'axios';
import { Platform } from 'react-native';

export { isAxiosError };

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

const LOCAL_HOST = 'localhost';
const ANDROID_EMULATOR_HOST = '10.0.2.2';
const PROD_API_URL = 'https://15.252.87.118.sslip.io/api/';

/**
 * The dev host is platform-dependent: the Android emulator cannot see the Mac's `localhost` and
 * reaches the host machine at `10.0.2.2` instead. Neither works on a *physical* device, where
 * `localhost` is the phone itself — for that, set `EXPO_PUBLIC_API_URL` to the machine's LAN address.
 */
const getDevBaseUrl = () => {
  const host = Platform.OS === 'android' ? ANDROID_EMULATOR_HOST : LOCAL_HOST;

  return `http://${host}:8080/api/`;
};

/**
 * Release builds talk to the deployed server; dev builds talk to the local one, so the app and
 * `localhost:8080/swagger-ui.html` are reading the same database. Hardcoding a host here previously
 * meant the app silently queried the deployed server during development while Swagger showed local
 * data — same credentials, two different databases, and no error to explain it.
 *
 * The two servers also sign tokens with different secrets (prod sets `JWT_SECRET`; local falls back to
 * the placeholder in `application.properties`), so a token from one is not accepted by the other.
 */
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? getDevBaseUrl() : PROD_API_URL);

const client = axios.create({ baseURL });

let isRefreshing = false;
let failedQueue: QueueItem[] = [];
let onLogout: (() => void) | null = null;

export const setLogoutCallback = (cb: () => void) => {
  onLogout = cb;
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

client.interceptors.request.use(
  async config => {
    const token = SecureStore.getItem(StorageKeys.TOKEN);

    if (token && !config.url?.includes(Urls.auth.refreshToken)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

client.interceptors.response.use(
  response => response,
  async error => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes(Urls.auth.login) &&
      !originalRequest.url?.includes(Urls.auth.refreshToken) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = SecureStore.getItem(StorageKeys.REFRESH_TOKEN);

      if (!refreshTokenValue) {
        isRefreshing = false;
        onLogout?.();
        return Promise.reject(error);
      }

      try {
        const { data } = await client.post(Urls.auth.refreshToken, {
          refreshToken: refreshTokenValue,
        });

        const { accessToken, refreshToken: newRefreshToken } = data.data;

        SecureStore.setItem(StorageKeys.TOKEN, accessToken);
        SecureStore.setItem(StorageKeys.REFRESH_TOKEN, newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        onLogout?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default client;
