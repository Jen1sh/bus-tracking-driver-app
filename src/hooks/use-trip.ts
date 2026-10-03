import { useAuthContext } from '@/contexts/auth.context';
import { describeDriverError } from '@/lib/driver-errors';
import { getErrorCode, getErrorMessage } from '@/lib/error';
import { endTrip, getAssignment, startTrip } from '@/services/trip.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { driverKeys } from './use-driver';

const useTrip = () => {
  const { logOut } = useAuthContext();

  const useDriverErrorGuard = () => (error: unknown) => {
    const { title, message, terminal } = describeDriverError(error);

    if (terminal) {
      void logOut();
    }

    Alert.alert(title, message || getErrorMessage(error));
  };

  /**
   * Activates the caller's earliest PENDING run dated today. Takes no body.
   *
   * The one-shot recovery below is the documented fix for 400 TRIP_NOT_FOUND: start looks up an
   * *existing* PENDING row owned by the caller and never creates one, so the only thing that can be
   * missing is the writing GET that materialises today's rows. Calling `getAssignment` directly (not
   * just invalidating the query) matters — if the dashboard is not mounted, an invalidation would be
   * a no-op and the retry would fail identically. Generation is idempotent, so a redundant call is
   * harmless.
   */
  const useStartTrip = () => {
    const queryClient = useQueryClient();
    const guard = useDriverErrorGuard();

    return useMutation({
      mutationFn: async () => {
        try {
          return await startTrip();
        } catch (err) {
          if (getErrorCode(err) === 'TRIP_NOT_FOUND') {
            await getAssignment().catch(() => undefined);

            return await startTrip();
          }

          throw err;
        }
      },
      onSuccess: async () => {
        // Awaited rather than fired and forgotten, because the trip's new status is spread across four
        // queries and they have to move together: the dashboard's `onDuty`/`canStartTrip`, the
        // schedule's run status, the roll sheet's `editable` flag, and the current-trip row the location
        // task keys off. `driverKeys.all` is the prefix all four live under, so this is what re-reads
        // the schedule without naming it here and letting the prefix rot.
        //
        // Awaiting keeps `isPending` true until they have, which closes a real window: the button would
        // otherwise flip out of "Starting" while still reading "Start Trip", and a second tap in that
        // gap 400s on a row that is already ACTIVE. Refetches settle rather than reject, so a failed
        // re-read shows as a stale screen instead of being reported as a failed start.
        await queryClient.invalidateQueries({ queryKey: driverKeys.all });
      },
      onError: err => {
        // canStartTrip was stale — refetch so the button reflects the real blocker.
        if (getErrorCode(err) === 'TRIP_ALREADY_ACTIVE') {
          void queryClient.invalidateQueries({ queryKey: driverKeys.assignment });
        }

        guard(err);
      },
    });
  };

  /**
   * Ends the caller's ACTIVE trip. `tripId` is an optional **query** param, required when the driver
   * holds more than one ACTIVE trip — pass the id from the current-trip payload (or `blockedByTripId`
   * from the assignment payload for a run left over from a previous day).
   */
  const useEndTrip = () => {
    const queryClient = useQueryClient();
    const guard = useDriverErrorGuard();

    return useMutation({
      mutationFn: (tripId?: number) => endTrip(tripId),
      onSuccess: async () => {
        // The same re-read as start, and for a sharper reason. `currentTrip` is what
        // `useLocationTracking` derives `shouldTrack` from, so until it resolves the native stream is
        // still registered against a trip that no longer exists — the bus would keep posting positions
        // for a run the server has already closed. Awaiting bounds that to the round trip and no longer,
        // and it is also what lets the End button's pending state actually mean "the trip is closed".
        await queryClient.invalidateQueries({ queryKey: driverKeys.all });
      },
      onError: err => {
        if (getErrorCode(err) === 'AMBIGUOUS_ACTIVE_TRIP') {
          // The current-trip endpoint never 400s in this state — it picks a stable one and hands back
          // the id to send, which is how the app gets out of it without an admin.
          void queryClient.invalidateQueries({ queryKey: driverKeys.currentTrip });
        }

        guard(err);
      },
    });
  };

  return { useStartTrip, useEndTrip };
};

export default useTrip;
