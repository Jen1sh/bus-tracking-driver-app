export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PARENT = 'PARENT',
}

export enum AccountStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

/**
 * A run whose day has not come carries `status: null` — never PENDING. `null` does not mean
 * "not started", it means "no `trips` row exists yet".
 */
export enum TripStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** Authoritative label for a run. `Bus.shift` ("AM"/"PM") is legacy and describes the bus, not the run. */
export enum ScheduleDirection {
  PICKUP = 'PICKUP',
  DROP = 'DROP',
}

/** A non-ACTIVE driver is 403'd out of every `/api/driver/**` endpoint. */
export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  INACTIVE = 'INACTIVE',
}

/** The driver app sees the raw status, including NOT_TODAY ("not marked"). The parent app never does. */
export enum AttendanceStatus {
  ONBOARD = 'ONBOARD',
  DROPPED = 'DROPPED',
  ABSENT = 'ABSENT',
  NOT_TODAY = 'NOT_TODAY',
}
