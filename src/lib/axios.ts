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

const getBaseUrl = () => {
  const host = Platform.OS === 'android' ? ANDROID_EMULATOR_HOST : LOCAL_HOST;

  return `http://${host}:8080/api/`;
};

const client = axios.create({
  baseURL: getBaseUrl(),
});

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
