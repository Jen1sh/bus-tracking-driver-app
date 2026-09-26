import { AttendanceStatus } from '../enums';

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

/**
 * One staged attendance change. `NOT_TODAY` is a legitimate input, not just a default — it clears a
 * student back to unmarked, which is what tapping an already-set status does. The whole batch is
 * rejected before anything is written if one studentId is not on the caller's bus.
 */
export interface RollSheetEntryUpdate {
  studentId: number;
  status: AttendanceStatus;
}

export interface RollSheetUpdateRequest {
  entries: RollSheetEntryUpdate[];
}
