import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

/**
 * The name the native side registers the stream under.
 *
 * Must stay byte-identical across releases. Renaming it orphans a stream already registered on a
 * driver's device, and nothing would ever stop it.
 *
 * This module owns the stream's *lifecycle* — when to start, when to stop, and what to ask the driver
 * for. The task body that receives fixes is registered in `app/_layout.tsx`, next to the entry point the
 * OS evaluates to wake a killed app, so the two halves stay in step by sharing only this name.
 */
export const LOCATION_TASK = 'bus-tracking-driver-location';

/**
 * How often a fix is reported.
 *
 * `distanceInterval: 0` is load-bearing and must be explicit. Android turns these into a fused-provider
 * `LocationRequest` (`LocationHelpers.prepareLocationRequest`), and `setMinUpdateDistanceMeters(distance)`
 * is a *trigger* condition rather than a filter applied afterwards — so any distance the bus has to cross
 * means silence whenever it isn't moving. Omitting the option does not disable that: it falls back to a
 * per-accuracy default, and that default is never zero. Setting it explicitly to zero is the only way to
 * let the interval drive delivery on its own.
 *
 * `Accuracy.High` rather than `Balanced`, and the reason is narrow enough to be worth writing down.
 * `Balanced` becomes `PRIORITY_BALANCED_POWER_ACCURACY`, which the **network** provider answers — cell
 * and Wi-Fi positioning. An emulator has neither, so the request has no provider able to satisfy it and
 * simply starves, while a real handset is fine. The failure is deceptive rather than obvious: Google
 * Maps' own `showsUserLocation` registers a separate *GPS-backed* request, which does acquire fixes, and
 * the fused provider then fans each one out to every registered client — including this task. So
 * opening the map appears to switch tracking on, when what it really does is supply the fix source this
 * request was starving for. `High` is GPS-backed, needs no such rescue, and is the accuracy a bus
 * position actually wants.
 *
 * The interval alone bounds volume, which is the driver's whole share of the `location_logs` and
 * WebSocket cost. Tuned tight for testing; 15s is the production cadence.
 */
const OPTIONS: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.High,
  showsBackgroundLocationIndicator: true,
  timeInterval: 3000,
  distanceInterval: 0,
  // Android runs this as a foreground service and needs a notification to stay alive. iOS ignores it and
  // shows its own background-location indicator instead.
  foregroundService: {
    notificationTitle: 'Trip in progress',
    notificationBody: 'Sharing your location with the school while you drive.',
  },
};

/**
 * Begins reporting positions, applying the current options every time.
 *
 * Deliberately *not* guarded by `hasStartedLocationUpdatesAsync`, even though that reads like the safe
 * thing to do. It is what made a change to `OPTIONS` impossible to apply: the guard turned a call on an
 * already-registered task into a no-op, and because the task registration is persisted natively, that
 * no-op survived every reload. So the options stayed frozen at whatever they were the first time the
 * task registered, and no amount of editing them moved anything — the edit was never delivered.
 *
 * Re-registering is the supported path, not a hazard. `TaskService.registerTask` handles an existing
 * task by handing it the new options, and `LocationTaskConsumer.setOptions` answers that with a clean
 * `stopLocationUpdates()` then `startLocationUpdates()` — same request, current config, no throw.
 */
export const startLocationTracking = async () => {
  await Location.startLocationUpdatesAsync(LOCATION_TASK, OPTIONS);
};

/**
 * Stops reporting.
 *
 * Guarded, unlike its counterpart above: `unregisterTask` throws `TaskNotFoundException` when the task
 * isn't there, and tearing the stream down on mount-and-unmount cycles makes that the common case.
 */
export const stopLocationTracking = async () => {
  if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
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
