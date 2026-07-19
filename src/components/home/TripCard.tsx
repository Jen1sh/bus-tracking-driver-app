import { StyledButton } from '@/components/styled/StyledButton';
import { TripStatus } from '@/types/enums';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import EmergencyButton from './EmergencyButton';
import RouteTimeline from './RouteTimeline';
import TripControls from './TripControls';
import TripHeader from './TripHeader';

export type TripCardProps = {
  busNumber: string;
  scheduledTime: string;
  date: string;
  attendeeCount: number;
  tripStatus: TripStatus;
  isStartLoading?: boolean;
  isEndLoading?: boolean;
  onStartTrip: () => void;
  onEndTrip: () => void;
};

const TripCard = ({
  busNumber,
  scheduledTime,
  date,
  attendeeCount,
  tripStatus,
  isStartLoading,
  isEndLoading,
  onStartTrip,
  onEndTrip,
}: TripCardProps) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <TripHeader
        busNumber={busNumber}
        scheduledTime={scheduledTime}
        date={date}
        label='NEXT SCHEDULE'
      />

      <RouteTimeline
        stops={[
          { name: 'Pickup', address: '' },
          { name: 'School', address: '' },
        ]}
      />

      <TripControls
        attendeeCount={attendeeCount}
        tripStatus={tripStatus}
        onStartTrip={onStartTrip}
        onEndTrip={onEndTrip}
        isLoading={isStartLoading || isEndLoading}
      />

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
