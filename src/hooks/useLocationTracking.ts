import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { postLocation } from '../services/trip.service';

const TASK_NAME = 'LOCATION_TRACKING_TASK';

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location tracking error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };

    for (const loc of locations) {
      try {
        await postLocation({
          busId: 1,
          tripId: 5,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          speed: 2,
        });
      } catch (err) {
        console.error('Failed to post location:', err?.response?.data);
      }
    }
  }
});

export async function requestPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();

  if (foreground.status !== 'granted') {
    return false;
  }

  const background = await Location.requestBackgroundPermissionsAsync();

  if (background.status !== 'granted') {
    return false;
  }

  return true;
}

export function showPermissionAlert() {
  Alert.alert(
    'Location Permission Required',
    'Please enable location access in Settings to start trip tracking.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Settings', onPress: () => Linking.openURL('app-settings:') },
    ],
  );
}

export function useLocationTracking() {
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    TaskManager.isTaskRegisteredAsync(TASK_NAME).then(setIsTracking);
  }, []);

  const startTracking = async (skipPermissionCheck = false) => {
    const granted = await requestPermissions();

    if (!granted) {
      showPermissionAlert();

      return false;
    }

    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Trip Active',
        notificationBody: 'Tracking your location for the active trip.',
      },
    });

    setIsTracking(true);

    return true;
  };

  const stopTracking = async () => {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
    setIsTracking(false);
  };

  return { isTracking, startTracking, stopTracking };
}
