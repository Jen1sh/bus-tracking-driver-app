import {
  AccountStatus,
  AttendanceStatus,
  DriverStatus,
  Role,
  ScheduleDirection,
  TripStatus,
} from '../enums';

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  /** Stable machine-readable code. Null on success. */
  error: string | null;
}

/* ---------------------------------- auth --------------------------------- */

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: Role;
  /** Null for SUPER_ADMIN and unlinked PARENTs. */
  schoolId: number | null;
  status: AccountStatus;
}

export interface AuthResponse {
  /** 15 minutes. */
  accessToken: string;
  /** 7 days, rotated on every refresh. */
  refreshToken: string;
  expiresIn: number;
  user: UserSummary;
  message?: string | null;
}

export type RefreshTokenResponse = Pick<AuthResponse, 'accessToken' | 'refreshToken' | 'expiresIn'>;

/* ---------------------------------- trips -------------------------------- */

export interface TripResponse {
  tripId: number;
  busId: number;
  /** The `drivers.id`, not the user id. */
  driverId: number;
  /** Actual departure, overwritten on start. Distinct from the *planned* departure. */
  startTime: string | null;
  endTime: string | null;
  status: TripStatus;
}

/* --------------------------- GET /driver/assignment ---------------------- */

export interface DriverBus {
  id: number;
  displayId: string | null;
  plate: string | null;
}

export interface RunSummary {
  tripId: number;
  /** Planned departure. */
  departureTime: string | null;
  direction: ScheduleDirection | null;
  label: string | null;
  status: string | null;
  /** True for the run the rest of the payload describes. */
  current: boolean;
}

export interface DriverAssignmentResponse {
  driverName: string | null;
  /** True while this bus's current run is ACTIVE. Derived from the trip, not from DriverStatus. */
  onDuty: boolean;
  /** True only when `POST /api/trips/start` would actually succeed. The Start button's only correct gate. */
  canStartTrip: boolean;
  /**
   * A stale ACTIVE trip blocking the bus — the one blocker the driver can clear themselves via
   * `POST /api/trips/end?tripId=`. Stays null for the other reasons `canStartTrip` can be false.
   */
  blockedByTripId: number | null;
  tripId: number | null;
  tripStatus: string | null;
  routeName: string | null;
  /** Legacy bus-level "AM"/"PM". Do not label a run with it — use `direction`. */
  shift: string | null;
  studentCount: number;
  stopCount: number;
  /** Always null: no stop coordinates exist to measure from. */
  routeDistanceKm: number | null;
  /** The *planned* departure, at every status. Never overwritten when the driver departs. */
  scheduledDeparture: string | null;
  direction: ScheduleDirection | null;
  /** The whole day for this bus. Unsorted at the tail when the driver was moved mid-day. */
  todaysRuns: RunSummary[];
  /** Always null: no depot is modelled. */
  depotName: string | null;
  bus: DriverBus;
}

/* ---------------------------- GET /driver/schedule ----------------------- */

export interface ScheduledRun {
  /** Stable identity is (scheduleId | overrideId) + date. Never tripId. */
  scheduleId: number | null;
  overrideId: number | null;
  /** YYYY-MM-DD, school-local. */
  date: string;
  /** Planned, HH:mm:ss wall clock. Null only on legacy rows belonging to no scheduled run. */
  departureTime: string | null;
  direction: ScheduleDirection | null;
  label: string | null;
  busId: number | null;
  busDisplayId: string | null;
  routeName: string | null;
  /** Null until the run's day arrives and its row is generated. */
  tripId: number | null;
  /** Null for a projected run — never PENDING for a future date. */
  status: TripStatus | null;
  /**
   * False while no `trips` row exists: the driver is only the schedule's *default* and an admin can
   * reassign the run on the morning it generates. Render future rows as provisional.
   */
  assignmentFirm: boolean;
}

export interface DriverScheduleResponse {
  /**
   * The run in front of the driver — the earliest of `upcoming` not already behind them. NOT
   * `upcoming[0]`. Null when nothing is ahead inside the horizon.
   */
  next: ScheduledRun | null;
  /** Every run from today to today + horizonDays - 1, date then time ascending, nulls last. */
  upcoming: ScheduledRun[];
  /** Read this rather than hardcoding 14. */
  horizonDays: number;
  /** Always ACTIVE in practice — a non-ACTIVE driver gets a 403 instead. */
  driverStatus: DriverStatus;
}

/* ------------------------- GET /driver/trip/current ---------------------- */

export interface NextStop {
  /** Null when the next target is the school rather than a route stop. */
  stopId: number | null;
  label: string | null;
  /** Always null — no stop coordinates exist to measure from. */
  distanceKm: number | null;
  /** Always null — no distance means no ETA. */
  etaMinutes: number | null;
}

export interface LastLocation {
  latitude: number;
  longitude: number;
  speed: number | null;
  /** Instant, UTC with `Z` — unlike every other date-time in this API. */
  recordedAt: string;
}

export interface DriverTripResponse {
  tripId: number;
  status: string;
  /** Actual departure. Pair with `scheduledDeparture` for "scheduled 07:30, left 07:41". */
  startedAt: string;
  routeName: string | null;
  busId: number;
  /** ONBOARD attendance intersected with the live roster — can never exceed totalStudents. */
  onBoard: number;
  totalStudents: number;
  nextStop: NextStop;
  /** Trip-scoped, null until this trip has posted a GPS update. */
  lastLocation: LastLocation | null;
}

/* ----------------------------- roll sheet -------------------------------- */

export interface RollSheetTotals {
  onBoard: number;
  dropped: number;
  absent: number;
  /** onBoard + dropped + absent */
  accountedFor: number;
  total: number;
}

export interface RollSheetEntry {
  studentId: number;
  name: string;
  klass: string | null;
  /** The student's checkpoint label. Null on most rows — the norm on current data. */
  stopLabel: string | null;
  /** Raw AttendanceStatus name. NOT_TODAY means "not marked". */
  status: AttendanceStatus;
}

export interface RollSheetResponse {
  tripId: number;
  tripStatus: string | null;
  routeName: string | null;
  /** Whether *this caller* may commit: true only while the trip is ACTIVE and attributed to them. */
  editable: boolean;
  totals: RollSheetTotals;
  students: RollSheetEntry[];
}

/* ------------------------------- location -------------------------------- */

export interface LocationResponse {
  busId: number;
  latitude: number;
  longitude: number;
  speed: number | null;
  /** Stamped server-side as a UTC Instant, not by the client. */
  recordedAt: string;
  /** Always ACTIVE on this path — the endpoint requires an ACTIVE trip. */
  tripStatus: TripStatus;
}
