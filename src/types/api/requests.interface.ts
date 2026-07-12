export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface StartTripRequest {
  busId: number;
}

export interface EndTripRequest {
  tripId: number;
}

export interface LocationUpdateRequest {
  busId: number;
  tripId: number;
  latitude: number;
  longitude: number;
  speed?: number;
}
