import BusDetailCard from '@/components/home/BusDetailCard';
import DepartureCard from '@/components/home/DepartureCard';
import GreetingHeader from '@/components/home/GreetingHeader';
import RouteShiftCard from '@/components/home/RouteShiftCard';
import { StyledText } from '@/components/styled/StyledText';
import useTrip from '@/hooks/use-trip';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

const Home = () => {
  const insets = useSafeAreaInsets();
  const { useNextScheduleSummary } = useTrip();
  const { data: summary, isLoading } = useNextScheduleSummary();
  const [isTripStarted, setIsTripStarted] = useState(false);

  useEffect(() => {
    return;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  const trip = summary!.trip;
  const bus = summary!.bus;
  const route = summary!.route;

  const scheduledTime = trip.startTime
    ? new Date(trip.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const tripDate = trip.date
    ? new Date(trip.date).toLocaleDateString([], {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <ScrollView
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        <GreetingHeader name='John Doe' status='on-duty' topInset={insets.top} />

        <RouteShiftCard
          routeName={route.name}
          shift='Morning Shift'
          studentCount={24}
          stopCount={12}
          tripCount={3}
        />

        <DepartureCard time={scheduledTime} date={tripDate} />

        <BusDetailCard plate={bus.plate} capacity={bus.capacity} />

        <TouchableOpacity
          style={[styles.startBtn, isTripStarted && styles.stopBtn]}
          onPress={() => setIsTripStarted(!isTripStarted)}
          activeOpacity={0.8}>
          <StyledText style={styles.btnLabel}>
            {isTripStarted ? 'End Trip' : 'Start Trip'}
          </StyledText>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  contentContainer: {
    gap: spacings.sm,
    paddingBottom: 0,
  },
  startBtn: {
    marginHorizontal: spacings.md,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  stopBtn: {
    backgroundColor: colors.secondary,
  },
  btnLabel: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.light,
  },
}));

export default Home;
