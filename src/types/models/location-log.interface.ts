export interface LocationLog {
  id: number;
  busId: number;
  tripId?: number;
  latitude: number;
  longitude: number;
  speed?: number;
  recordedAt: string;
}
