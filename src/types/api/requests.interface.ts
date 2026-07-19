export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  speed?: number;
}
