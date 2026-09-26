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
      onSuccess: () => {
        // The dashboard advances to the run in progress and the roll sheet's editable flag flips, so
        // the whole driver-facing set has to be re-read rather than patched.
        void queryClient.invalidateQueries({ queryKey: driverKeys.all });
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
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: driverKeys.all });
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
