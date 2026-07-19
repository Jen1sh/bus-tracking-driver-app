import { Urls } from '@/constants/urls';
import client from '@/lib/axios';
import { LocationUpdateRequest } from '@/types/api/requests.interface';
import {
  APIResponse,
  NextScheduleAttendeesResponse,
  NextScheduleSummaryResponse,
  TripResponse,
} from '@/types/api/responses.interface';

export const startTrip = async () => {
  const res = await client.post<APIResponse<TripResponse>>(Urls.trip.startTrip);

  return res.data;
};

export const endTrip = async () => {
  const res = await client.post<APIResponse<TripResponse>>(Urls.trip.endTrip);

  return res.data;
};

export const postLocation = async (data: LocationUpdateRequest) => {
  const res = await client.post(Urls.location.updateLocation, data);

  return res.data;
};

export const getNextScheduleSummary = async () => {
  const res = await client.get<APIResponse<NextScheduleSummaryResponse | null>>(
    Urls.driver.nextScheduleSummary,
  );

  return res.data;
};

export const getNextScheduleAttendees = async () => {
  const res = await client.get<APIResponse<NextScheduleAttendeesResponse>>(
    Urls.driver.nextScheduleAttendees,
  );

  return res.data;
};
