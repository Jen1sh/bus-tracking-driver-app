import { TripStatus } from '../enums';

export interface Trip {
  id: number;
  busId: number;
  driverId?: number;
  startTime?: string;
  endTime?: string;
  status: TripStatus;
  date: string;
}
