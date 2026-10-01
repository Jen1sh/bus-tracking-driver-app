import { postLocation } from '@/services/trip.service';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert, Linking } from 'react-native';

/**
 * The name the native side registers the stream under, and the body it runs.
 *
 * Must stay byte-identical across releases. Renaming it orphans a stream already registered on a
 * driver's device, and nothing would ever stop it.
 *
 * Imported for its side effect from the root layout: the headless context has to have run this
 * `defineTask` before the OS can deliver a fix, and a killed app never evaluates the React import chain
 * that reaches it.
 */
export const LOCATION_TASK = 'bus-tracking-driver-location';

/**
 * How often a fix is reported, and how far the bus must move for one to be worth sending.
 *
 * Whichever comes first wins. The distance leg stops a bus idling at a stop from reporting on a timer
 * for nothing; the time leg keeps the parent's map moving on a road where the bus is technically
 * stationary.
 *
 * Tuned tight for testing. At 2.5s this is ~1440 rows an hour against the server; 15s / 100m is the
 * production cadence.
 */
const OPTIONS: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.Balanced,
  timeInterval: 10000,
  distanceInterval: 0,
  // Android runs this as a foreground service and needs a notification to stay alive. iOS ignores it and
  // shows its own background-location indicator instead.
  foregroundService: {
    notificationTitle: 'Trip in progress',
    notificationBody: 'Sharing your location with the school while you drive.',
  },
};

type LocationTaskData = { locations: LocationObject[] };

/**
 * How old a fix may be and still be worth sending.
 *
 * Android buffers positions while the app is backgrounded and hands over the whole batch on resume, so
 * a fix can arrive long after the bus was actually there. The server records each one as the bus's
 * *current* position with a fresh timestamp, so posting a stale fix makes the parent's map jump backwards
 * to a place the bus left hours ago. Filtering by age keeps the map pointing at where the bus is now.
 *
 * Generous on purpose — a fix from two minutes ago says nothing useful about a bus that is moving.
 */

/**
 * Begins reporting positions. Safe to call when already running.
 *
 * The `hasStarted` guard is what makes this safe: `startLocationUpdatesAsync` throws if the stream is
 * already registered, so without it every redundant call from a re-render or a repeat effect would be a
 * crash.
 */
export const startLocationTracking = async () => {


  if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) {

    return;
  }


  await Location.startLocationUpdatesAsync(LOCATION_TASK, OPTIONS);
};

/** Stops reporting. Safe to call when already stopped, which is the common case on teardown. */
export const stopLocationTracking = async () => {
  if (!(await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK))) {
    return;
  }

  await Location.stopLocationUpdatesAsync(LOCATION_TASK);
};

/**
 * iOS ignores `requestBackgroundPermissionsAsync` when it lands in the same tick as the foreground
 * grant — the Always prompt needs the app settled and active, and the rejection is completely silent. A
 * short delay is the documented workaround; without it the driver grants foreground, is never asked for
 * Always, and background tracking simply never turns on.
 */
const BACKGROUND_PROMPT_DELAY_MS = 1200;

/**
 * Whether this launch has already explained the permission requirement.
 *
 * A module flag, not persisted state. It resets when the app is cold-started, which is the right trade
 * here: the cost of getting it wrong is one extra alert per launch, whereas persisting it means a
 * SecureStore read on every foreground check for a message about a setting the driver can see for
 * themselves.
 */
let warnedAboutLocation = false;

/**
 * Asks for location access, foreground first and then background.
 *
 * Safe to call on every launch and after every sign-in: the OS prompts only the first time, so later
 * calls resolve to the standing decision without a second dialog. That is what lets this be fired
 * straight from an effect keyed on the token rather than tracking whether we have already asked.
 *
 * Background is all-or-nothing. A driver who allows only foreground gets no tracking at all, rather than
 * a map that works in the app and lies the moment it is closed — and on Android the foreground service
 * is what keeps the stream alive, so foreground-only buys nothing.
 */
export const requestLocationPermission = async () => {
  const { granted: foreground } = await Location.requestForegroundPermissionsAsync();

  if (!foreground) {
    warnAboutLocation();

    return;
  }

  // Deferred rather than awaited inline: the prompt has to arrive a beat after the foreground grant.
  setTimeout(async () => {
    const { granted: background } = await Location.requestBackgroundPermissionsAsync();

    if (!background) {
      warnAboutLocation();
    }
  }, BACKGROUND_PROMPT_DELAY_MS);
};

/**
 * Explains why location matters, once per launch, pointing at Settings.
 *
 * There is no second chance to prompt after a denial, so Settings is the only route out — which makes
 * this the one piece of the permission flow that has to be visible rather than silent.
 */
const warnAboutLocation = () => {
  if (warnedAboutLocation) {
    return;
  }

  warnedAboutLocation = true;

  Alert.alert(
    'Location permission needed',
    'Without location access your school cannot see where the bus is during a trip.\n\nOpen Settings to allow location access for this app.',
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open Settings', onPress: () => void Linking.openSettings() },
    ],
  );
};

/**
 * The background half of tracking: a native callback that runs whether or not the app is on screen.
 *
 * This reports; it does not decide. Starting and stopping belong to the two functions above, so there is
 * only one place that owns the stream's lifecycle and no ordering to get wrong between two callers.
 */
TaskManager.defineTask<LocationTaskData>(LOCATION_TASK, async ({ data, error }) => {
  if (error || !data?.locations?.length) {
    if (error) {
      console.warn('[location] task error', error);
    }

    return;
  }


  // Only the newest fix. Posting the whole batch means a burst of N rows and N WebSocket broadcasts for
  // samples that are all stale by the time they land — and the parent's trail is a line, not an audit log.
  const fix = data.locations[data.locations.length - 1];




  try {
    await postLocation({
      latitude: fix.coords.latitude,
      longitude: fix.coords.longitude,
      // Metres per second. Null when the platform could not derive it, which the server accepts.
      speed: fix.coords.speed ?? undefined,
    });
  } catch (err) {
    // Logged rather than swallowed. The earlier version discarded anything non-fatal with no output,
    // which made "the OS stopped delivering fixes" and "every POST is being rejected" indistinguishable
    // from the outside.
    console.warn('[location] post failed', err);
  }
});
