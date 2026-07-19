import { StyledButton } from '@/components/styled/StyledButton';
import { StyledText } from '@/components/styled/StyledText';
import { TripStatus } from '@/types/enums';
import type { NextScheduleSummaryResponse } from '@/types/api/responses.interface';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type TripTabProps = {
  summary: NextScheduleSummaryResponse;
  isStartLoading?: boolean;
  isEndLoading?: boolean;
  onStartTrip: () => void;
  onEndTrip: () => void;
};

const TripTab = ({
  summary,
  isStartLoading,
  isEndLoading,
  onStartTrip,
  onEndTrip,
}: TripTabProps) => {
  const { trip, bus } = summary;

  const startTime = trip.startTime
    ? new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      <StyledText variant='caption' style={styles.label}>
        NEXT SCHEDULE
      </StyledText>

      <StyledText style={styles.timeRange}>{startTime}</StyledText>

      <StyledText variant='caption' style={styles.date}>
        {tripDate}
      </StyledText>

      <StyledText style={styles.busInfo}>Bus: {bus.plate}</StyledText>

      {trip.status !== TripStatus.COMPLETED && (
        <StyledButton
          title={trip.status === TripStatus.ACTIVE ? 'Stop Trip' : 'Start Trip'}
          variant={trip.status === TripStatus.ACTIVE ? 'secondary' : 'primary'}
          icon={trip.status === TripStatus.ACTIVE ? 'stop-circle-outline' : 'play-circle-outline'}
          onPress={trip.status === TripStatus.ACTIVE ? onEndTrip : onStartTrip}
          loading={isStartLoading || isEndLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    padding: spacings.md,
    gap: spacings.md,
  },
  label: {
    letterSpacing: 1.2,
  },
  timeRange: {
    fontSize: 22,
    fontFamily: 'RubikSemiBold',
    color: colors.primary,
  },
  busInfo: {
    fontSize: 15,
    fontFamily: 'RubikMedium',
    color: colors.text,
  },
  date: {
    color: colors.placeholderText,
  },
}));

export default TripTab;
