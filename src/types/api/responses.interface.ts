import { AccountStatus, Role, TripStatus } from '../enums';

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  error: string | null;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: Role;
  schoolId: number | null;
  status: AccountStatus;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSummary;
  message?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSummary;
  message: string | null;
}

export interface TripResponse {
  tripId: number;
  busId: number;
  driverId: number;
  startTime: string | null;
  endTime: string | null;
  status: TripStatus;
}

export interface LocationResponse {
  busId: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  recordedAt: string;
  tripStatus: TripStatus;
}
