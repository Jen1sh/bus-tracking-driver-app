import { useMutation, useQuery } from '@tanstack/react-query';

export const DUMMY_SUMMARY = {
  trip: {
    tripId: 1,
    startTime: '2026-07-20T08:30:00',
    endTime: null,
    date: '2026-07-20',
    status: 'PENDING' as const,
  },
  bus: {
    busId: 1,
    plate: 'BUS-101',
    capacity: 40,
  },
  route: {
    routeId: 1,
    name: 'Downtown East — School #42',
  },
};

const DUMMY_ATTENDEES = {
  students: [
    { id: 1, name: 'Alice Johnson', class: '5A', stop: 'Main St' },
    { id: 2, name: 'Bob Smith', class: '5A', stop: 'Oak Ave' },
    { id: 3, name: 'Charlie Brown', class: '6B', stop: 'Elm St' },
    { id: 4, name: 'Diana Prince', class: '6B', stop: 'Pine Rd' },
    { id: 5, name: 'Edward Norton', class: '7C', stop: 'Maple Dr' },
    { id: 6, name: 'Fiona Apple', class: '7C', stop: 'Cedar Ln' },
    { id: 7, name: 'George Lucas', class: '5A', stop: 'Main St' },
    { id: 8, name: 'Hannah Montana', class: '6B', stop: 'Elm St' },
  ],
};

const useTrip = () => {
  const useStartTrip = () =>
    useMutation({
      mutationFn: async () => {},
      onSuccess: async () => {},
    });

  const useEndTrip = () =>
    useMutation({
      mutationFn: async () => {},
      onSuccess: async () => {},
    });

  const useNextScheduleSummary = () =>
    useQuery({
      queryKey: ['next-schedule-summary'],
      queryFn: async () => DUMMY_SUMMARY,
    });

  const useNextScheduleAttendees = () =>
    useQuery({
      queryKey: ['next-schedule-attendees'],
      queryFn: async () => DUMMY_ATTENDEES,
    });

  return {
    useStartTrip,
    useEndTrip,
    useNextScheduleSummary,
    useNextScheduleAttendees,
  };
};

export default useTrip;
