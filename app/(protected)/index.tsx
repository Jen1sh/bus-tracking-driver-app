import TripCard from '@/components/home/TripCard';
import { StyledText } from '@/components/styled/StyledText';
import useTrip from '@/hooks/use-trip';
import { TripStatus } from '@/types/enums';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

const Home = () => {
  const {
    useStartTrip,
    useEndTrip,
    useNextScheduleSummary,
    useNextScheduleAttendees,
    startTracking,
  } = useTrip();
  const { data: summary, isLoading: summaryLoading } = useNextScheduleSummary();
  const { data: attendees } = useNextScheduleAttendees();
  const { mutate: startTrip, isPending: isStartLoading } = useStartTrip();
  const { mutate: endTrip, isPending: isEndLoading } = useEndTrip();

  const checkTripStatus = () => {
    setTimeout(() => {
      if (!summary) return;

      if (summary.trip.status === TripStatus.ACTIVE) {
        console.log('tracking');

        startTracking(true);
      }
    }, 0);
  };

  useEffect(() => {
    checkTripStatus();
  }, [summary, startTracking]);

  if (summaryLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size='large' />
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView style={styles.centered}>
        <StyledText>No upcoming schedule</StyledText>
      </SafeAreaView>
    );
  }

  const scheduledTime = summary.trip.startTime
    ? new Date(summary.trip.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const tripDate = summary.trip.date
    ? new Date(summary.trip.date).toLocaleDateString([], {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        <TripCard
          busNumber={summary.bus.plate}
          scheduledTime={scheduledTime}
          date={tripDate}
          attendeeCount={attendees?.students.length ?? 0}
          tripStatus={summary.trip.status}
          isStartLoading={isStartLoading}
          isEndLoading={isEndLoading}
          onStartTrip={() => startTrip()}
          onEndTrip={() => endTrip()}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create(({ spacings }) => ({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacings.md,
  },
}));

export default Home;
