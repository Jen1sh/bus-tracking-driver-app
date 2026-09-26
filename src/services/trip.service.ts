import { Urls } from '@/constants/urls';
import client from '@/lib/axios';
import { LocationUpdateRequest, RollSheetUpdateRequest } from '@/types/api/requests.interface';
import {
  APIResponse,
  DriverAssignmentResponse,
  DriverScheduleResponse,
  DriverTripResponse,
  LocationResponse,
  RollSheetResponse,
  TripResponse,
} from '@/types/api/responses.interface';

/**
 * The pre-trip dashboard, and the only endpoint that materialises today's `trips` rows despite being a
 * GET. `POST /trips/start` looks up an *existing* PENDING row owned by the caller and never creates
 * one, so this must run before Start or start fails with 400 TRIP_NOT_FOUND. Safe to call repeatedly;
 * generation is idempotent.
 */
export const getAssignment = async () => {
  const res = await client.get<APIResponse<DriverAssignmentResponse>>(Urls.driver.assignment);

  return res.data;
};

/**
 * The driver's own runs out to the projection horizon. Read-only — it never creates a trip row, so it
 * is *not* a substitute for `getAssignment` when starting a trip.
 */
export const getSchedule = async () => {
  const res = await client.get<APIResponse<DriverScheduleResponse>>(Urls.driver.schedule);

  return res.data;
};

/**
 * The active-trip screen's rehydration state. `data` is null on a 200 when there is no ACTIVE trip
 * dated today — an empty screen, not an error. An ACTIVE trip from an earlier day is deliberately not
 * reported, though `endTrip` can still close it.
 */
export const getCurrentTrip = async () => {
  const res = await client.get<APIResponse<DriverTripResponse | null>>(Urls.driver.currentTrip);

  return res.data;
};

/** Readable whatever the trip's status; `editable` says whether this caller may commit. */
export const getRollSheet = async () => {
  const res = await client.get<APIResponse<RollSheetResponse>>(Urls.driver.rollSheet);

  return res.data;
};

/** Stage-then-commit: the whole batch in one call, re-synced from the identical response shape. */
export const commitRollSheet = async (data: RollSheetUpdateRequest) => {
  const res = await client.post<APIResponse<RollSheetResponse>>(Urls.driver.rollSheet, data);

  return res.data;
};

/** No request body, no query params. Resolves the driver from the JWT. */
export const startTrip = async () => {
  const res = await client.post<APIResponse<TripResponse>>(Urls.trip.startTrip);

  return res.data;
};

/**
 * No request body. `tripId` is an optional **query** param, not a JSON field.
 *
 * It is required when the caller holds more than one ACTIVE trip — without it the server refuses with
 * 400 AMBIGUOUS_ACTIVE_TRIP rather than guess, since ordering cannot tell two simultaneous trips apart.
 * The lookup is deliberately not date-scoped, so this is also how a stale ACTIVE trip left over from a
 * previous day gets closed: pass the `blockedByTripId` from the assignment payload.
 */
export const endTrip = async (tripId?: number) => {
  const res = await client.post<APIResponse<TripResponse>>(Urls.trip.endTrip, undefined, {
    params: tripId != null ? { tripId } : undefined,
  });

  return res.data;
};

export const postLocation = async (data: LocationUpdateRequest) => {
  const res = await client.post<APIResponse<LocationResponse>>(Urls.location.updateLocation, data);

  return res.data;
};
