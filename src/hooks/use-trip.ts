import { getErrorMessage } from '@/lib/error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import {
  endTrip as endTripApi,
  getNextScheduleAttendees,
  getNextScheduleSummary,
  startTrip as startTripApi,
} from '../services/trip.service';
import { useLocationTracking } from './useLocationTracking';

const useTrip = () => {
  const { startTracking, stopTracking } = useLocationTracking();
  const queryClient = useQueryClient();

  const useStartTrip = () =>
    useMutation({
      mutationFn: () => startTripApi(),
      onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: ['next-schedule-summary'] });
        queryClient.invalidateQueries({ queryKey: ['next-schedule-attendees'] });
      },
      onError: err => {
        Alert.alert('Failed to Start Trip', getErrorMessage(err));
      },
    });

  const useEndTrip = () =>
    useMutation({
      mutationFn: () => endTripApi(),
      onSuccess: async () => {
        await stopTracking();
        queryClient.invalidateQueries({ queryKey: ['next-schedule-summary'] });
        queryClient.invalidateQueries({ queryKey: ['next-schedule-attendees'] });
      },
      onError: err => {
        Alert.alert('Failed to End Trip', getErrorMessage(err));
      },
    });

  const useNextScheduleSummary = () =>
    useQuery({
      queryKey: ['next-schedule-summary'],
      queryFn: async () => {
        const res = await getNextScheduleSummary();
        return res.data;
      },
    });

  const useNextScheduleAttendees = () =>
    useQuery({
      queryKey: ['next-schedule-attendees'],
      queryFn: async () => {
        const res = await getNextScheduleAttendees();
        return res.data;
      },
    });

  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ['next-schedule-summary'] });
    queryClient.invalidateQueries({ queryKey: ['next-schedule-attendees'] });
  };

  return {
    useStartTrip,
    useEndTrip,
    useNextScheduleSummary,
    useNextScheduleAttendees,
    refetchAll,
    startTracking,
    stopTracking,
  };
};

export default useTrip;
