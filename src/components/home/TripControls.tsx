import { StyledButton } from '@/components/styled/StyledButton';
import { StyledText } from '@/components/styled/StyledText';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type TripControlsProps = {
  attendeeCount: number;
};

const TripControls = ({ attendeeCount }: TripControlsProps) => {
  const { isTracking, startTracking, stopTracking } = useLocationTracking();

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <View style={styles.attendeeBadge}>
          <StyledText style={styles.attendeeIcon}>👥</StyledText>
          <StyledText style={styles.attendeeText}>{attendeeCount} attendees</StyledText>
        </View>
      </View>
      <StyledButton
        title={isTracking ? 'Stop Trip' : 'Start Trip'}
        variant={isTracking ? 'secondary' : 'primary'}
        icon={isTracking ? 'stop-circle-outline' : 'play-circle-outline'}
        onPress={isTracking ? stopTracking : startTracking}
      />
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
