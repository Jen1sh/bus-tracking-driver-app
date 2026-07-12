import { getErrorMessage } from '@/lib/error';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';
import { endTrip as endTripApi, startTrip as startTripApi } from '../services/trip.service';
import { useLocationTracking } from './useLocationTracking';

const useTrip = () => {
  const { isTracking, startTracking, stopTracking } = useLocationTracking();
  const [tripId, setTripId] = useState<number | null>(null);

  const useStartTrip = () =>
    useMutation({
      mutationFn: () => startTripApi(1),
      onSuccess: async () => {
        setTripId(5);
        await startTracking(true);
      },
      onError: err => {
        Alert.alert('Failed to Start Trip', getErrorMessage(err));
      },
    });

  const useEndTrip = () =>
    useMutation({
      mutationFn: () => endTripApi(tripId!),
      onSuccess: async () => {
        await stopTracking();
        setTripId(null);
      },
      onError: err => {
        Alert.alert('Failed to End Trip', getErrorMessage(err));
      },
    });

  return { useStartTrip, useEndTrip, tripId, isTracking };
};

export default useTrip;
