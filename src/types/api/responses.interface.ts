import { TripStatus } from '../enums';

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  error: string | null;
}

export interface TripResponse {
  tripId: number;
  busId: number;
  driverId: number;
  startTime: string | null;
  endTime: string | null;
  status: TripStatus;
}

export interface TripInfo {
  tripId: number;
  startTime: string;
  endTime: string | null;
  date: string;
  status: TripStatus;
}

export interface BusInfo {
  busId: number;
  plate: string;
  capacity: number;
}

export interface RouteInfo {
  routeId: number;
  name: string;
}

export interface NextScheduleSummaryResponse {
  trip: TripInfo;
  bus: BusInfo;
  route: RouteInfo | null;
}

export interface StudentInfo {
  id: number;
  name: string;
}

export interface NextScheduleAttendeesResponse {
  students: StudentInfo[];
}
