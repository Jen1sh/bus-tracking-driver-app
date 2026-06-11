import { StorageKeys } from '@/constants/storage-keys';
import { SecureStore } from '@/lib/secure-store';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { AppTheme } from '../unistyles';

export const useAppTheme = () => {
  const { rt } = useUnistyles();

  const updateTheme = (theme: AppTheme) => {
    UnistylesRuntime.setTheme(theme);
    SecureStore.setItem(StorageKeys.THEME, theme);
  };

  return {
    theme: rt.themeName as AppTheme,
    updateTheme,
  };
};
