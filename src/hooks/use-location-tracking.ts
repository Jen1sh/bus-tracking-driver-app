import { startLocationTracking, stopLocationTracking } from '@/lib/location';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import useDriver from './use-driver';

/**
 * Tracks the bus whenever a trip is running and the driver has allowed it.
 *
 * The server decides whether a trip is running, not the Start and End buttons, so this reads
 * `GET /driver/trip/current` rather than being driven by the mutations. A trip can be ended from another
 * device or by an admin, and after a restart the app has to recover the right state rather than assume
 * whatever it last did is still true.
 */
const useLocationTracking = () => {
  const { useCurrentTrip } = useDriver();
  const { data: currentTrip, isLoading } = useCurrentTrip();

  /**
   * Read straight from the OS on every foreground rather than mirrored into state once.
   *
   * The permission is a fact the OS owns, and this hook is the only thing that needs it — so there is
   * nothing to gain from caching a copy that could go stale the moment the driver changes it in Settings.
   * `null` means "not read yet", which is deliberately distinct from `false`: an unanswered read must
   * not be mistaken for a refusal, or a cold start tears down a stream the driver never asked to stop.
   */
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const read = async () => {
      const { granted: allowed } = await Location.getBackgroundPermissionsAsync();

      if (!cancelled) {
        setGranted(allowed);
      }
    };

    void read();

    // Re-read on every foreground. This is the only signal that catches a permission granted while the
    // app was away — which is exactly what Android does during the background grant, since it deep-links
    // through Settings and returns here afterwards.
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void read();
      }
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  // `tripId`, never `currentTrip`. The response carries a `lastLocation.recordedAt` that moves on every
  // position the server records, so the object is a new reference on each refetch and depending on it
  // would restart tracking constantly for no reason.
  const tripId = currentTrip?.tripId ?? null;

  const shouldTrack = tripId != null && granted === true;

  useEffect(() => {
    // Both "not read yet" states are no-ops rather than negative answers. Acting on them is what made a
    // cold start tear down a stream the driver never asked to stop: the query is still in flight, so
    // there is no trip id yet, and that looks identical to a trip having ended.
    if (isLoading || granted === null) {
      return;
    }

    void (shouldTrack ? startLocationTracking() : stopLocationTracking()).catch(err => {
      console.warn('[location] could not change tracking state', err);
    });
  }, [shouldTrack, granted, isLoading]);
};

export default useLocationTracking;
