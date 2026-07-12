import { Urls } from '@/constants/urls';
import client from '@/lib/axios';
import { LocationUpdateRequest } from '@/types/api/requests.interface';

export const startTrip = async (busId: number) => {
  const res = await client.post(Urls.trip.startTrip, { busId });

  return res.data;
};

export const endTrip = async (tripId: number) => {
  const res = await client.post(Urls.trip.endTrip, { tripId });

  return res.data;
};

export const postLocation = async (data: LocationUpdateRequest) => {
  const res = await client.post(Urls.location.updateLocation, data);

  return res.data;
};
