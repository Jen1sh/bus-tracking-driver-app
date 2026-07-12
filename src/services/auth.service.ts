import { Urls } from '@/constants/urls';
import client from '@/lib/axios';
import { LoginRequest, RefreshRequest } from '@/types/api/requests.interface';
import { APIResponse, AuthResponse, RefreshTokenResponse } from '@/types/api/responses.interface';

export const login = async (data: LoginRequest) => {
  const res = await client.post<APIResponse<AuthResponse>>(Urls.auth.login, data);

  return res.data;
};

export const getRefreshToken = async (data: RefreshRequest) => {
  const res = await client.post<APIResponse<RefreshTokenResponse>>(Urls.auth.refreshToken, data);

  return res.data;
};
