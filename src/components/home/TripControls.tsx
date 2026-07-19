import { StyledButton } from '@/components/styled/StyledButton';
import { StyledText } from '@/components/styled/StyledText';
import { TripStatus } from '@/types/enums';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type TripControlsProps = {
  attendeeCount: number;
  tripStatus: TripStatus;
  onStartTrip: () => void;
  onEndTrip: () => void;
  isLoading?: boolean;
};

const TripControls = ({
  attendeeCount,
  tripStatus,
  onStartTrip,
  onEndTrip,
  isLoading,
}: TripControlsProps) => {
  const isActive = tripStatus === TripStatus.ACTIVE;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <View style={styles.attendeeBadge}>
          <StyledText style={styles.attendeeIcon}>👥</StyledText>
          <StyledText style={styles.attendeeText}>{attendeeCount} attendees</StyledText>
        </View>
      </View>
      {tripStatus !== TripStatus.COMPLETED && (
        <StyledButton
          title={isActive ? 'Stop Trip' : 'Start Trip'}
          variant={isActive ? 'secondary' : 'primary'}
          icon={isActive ? 'stop-circle-outline' : 'play-circle-outline'}
          onPress={isActive ? onEndTrip : onStartTrip}
          loading={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    gap: spacings.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.xs,
    borderRadius: 12,
  },
  attendeeIcon: {
    fontSize: 14,
  },
  attendeeText: {
    fontSize: 13,
    fontFamily: 'RubikMedium',
    color: colors.text,
  },
}));

export default TripControls;
