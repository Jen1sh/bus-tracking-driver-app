import { StyledButton } from '@/components/styled/StyledButton';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import EmergencyButton from './EmergencyButton';
import RouteTimeline from './RouteTimeline';
import TripControls from './TripControls';
import TripHeader from './TripHeader';

const TRIP_STOPS = [
  { name: 'Main Street Station', address: '123 Main St' },
  { name: 'Downtown Terminal', address: '456 Oak Ave' },
];

const TripCard = () => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <TripHeader busNumber='BUS-101' scheduledTime='8:30 AM' label='NEXT SCHEDULE' />

      <RouteTimeline stops={TRIP_STOPS} />

      <TripControls attendeeCount={8} />

      <EmergencyButton />

      <StyledButton
        title='View on Map'
        icon='map-outline'
        onPress={() => router.push('/(protected)/(stack)/map')}
      />
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacings.lg,
    gap: spacings.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
}));

export default TripCard;
