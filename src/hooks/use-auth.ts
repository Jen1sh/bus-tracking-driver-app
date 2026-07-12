import { StorageKeys } from '@/constants/storage-keys';
import { useAuthContext } from '@/contexts/auth.context';
import { getErrorMessage } from '@/lib/error';
import { SecureStore } from '@/lib/secure-store';
import { LoginRequest } from '@/types/api/requests.interface';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { login } from '../services/auth.service';

const useAuth = () => {
  const { storeToken } = useAuthContext();

  const useLogin = () =>
    useMutation({
      mutationFn: (body: LoginRequest) => login(body),
      onSuccess: res => {
        storeToken(res.data.accessToken);
        SecureStore.setItem(StorageKeys.REFRESH_TOKEN, res.data.refreshToken);
      },
      onError: err => {
        console.log('err', err);

        Alert.alert('Login Failed', getErrorMessage(err));
      },
    });

  return { useLogin };
};

export default useAuth;
