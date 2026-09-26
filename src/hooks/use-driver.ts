import {
  commitRollSheet,
  getAssignment,
  getCurrentTrip,
  getRollSheet,
  getSchedule,
} from '@/services/trip.service';
import { RollSheetEntryUpdate } from '@/types/api/requests.interface';
import { describeDriverError } from '@/lib/driver-errors';
import { getErrorMessage } from '@/lib/error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const driverKeys = {
  all: ['driver'] as const,
  assignment: ['driver', 'assignment'] as const,
  schedule: ['driver', 'schedule'] as const,
  currentTrip: ['driver', 'trip', 'current'] as const,
  rollSheet: ['driver', 'roll-sheet'] as const,
};

const useDriver = () => {
  /**
   * The pre-trip dashboard — the app's primary source of truth.
   *
   * This is the one endpoint that writes despite being a GET: it materialises today's `trips` rows, so
   * it must run before Start or start fails with 400 TRIP_NOT_FOUND. Refetched on app foreground and on
   * pull-to-refresh, because a stale answer would offer a Start button that reliably 400s.
   */
  const useAssignment = () =>
    useQuery({
      queryKey: driverKeys.assignment,
      queryFn: async () => (await getAssignment()).data,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
    });

  /**
   * The driver's own runs to the projection horizon. Read-only, and it never creates a trip row, so it
   * is *not* a substitute for `useAssignment` when starting a trip.
   */
  const useSchedule = () =>
    useQuery({
      queryKey: driverKeys.schedule,
      queryFn: async () => (await getSchedule()).data,
      retry: false,
    });

  /**
   * Rehydrates the active-trip screen after a restart or resume. `data` is null on a 200 when nothing
   * is running — an empty screen, not a failure, and never to be treated as an error state.
   */
  const useCurrentTrip = () =>
    useQuery({
      queryKey: driverKeys.currentTrip,
      queryFn: async () => (await getCurrentTrip()).data,
      refetchOnWindowFocus: true,
      retry: false,
    });

  /**
   * The bus's roster with today's attendance. Readable at any trip status, but 400s with
   * TRIP_NOT_FOUND when the dashboard has not run yet on a day with no rows — so `retry` is off, since
   * the same call keeps failing until the driver loads Home.
   */
  const useRollSheet = () =>
    useQuery({
      queryKey: driverKeys.rollSheet,
      queryFn: async () => (await getRollSheet()).data,
      retry: false,
    });

  /** Stage every edit locally, then commit the whole batch in one call and re-sync from the response. */
  const useCommitRollSheet = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (entries: RollSheetEntryUpdate[]) => commitRollSheet({ entries }),
      onSuccess: res => {
        // The commit returns the identical payload shape as the GET, already updated — adopt it rather
        // than issuing a second round trip.
        queryClient.setQueryData(driverKeys.rollSheet, res.data);
        void queryClient.invalidateQueries({ queryKey: driverKeys.currentTrip });
      },
      onError: err => {
        const { title, message } = describeDriverError(err);
        Alert.alert(title, message || getErrorMessage(err));
      },
    });
  };

  return {
    useAssignment,
    useSchedule,
    useCurrentTrip,
    useRollSheet,
    useCommitRollSheet,
  };
};

export default useDriver;
