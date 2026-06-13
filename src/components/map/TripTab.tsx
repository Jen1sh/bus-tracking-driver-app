import { StyledButton } from '@/components/styled/StyledButton';
import { StyledText } from '@/components/styled/StyledText';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const TripTab = () => {
  const { isTracking, startTracking, stopTracking } = useLocationTracking();

  return (
    <View style={styles.container}>
      <StyledText variant='caption' style={styles.label}>
        NEXT SCHEDULE
      </StyledText>

      <StyledText style={styles.timeRange}>8:30 AM - 10:30 AM</StyledText>

      <View style={styles.routeRow}>
        <View style={styles.timeline}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <View style={styles.dot} />
        </View>
        <View style={styles.locations}>
          <View style={styles.locationItem}>
            <StyledText style={styles.locationName}>Main Street Station</StyledText>
            <StyledText variant='caption' style={styles.locationAddress}>
              123 Main St
            </StyledText>
          </View>
          <View style={styles.locationItem}>
            <StyledText style={styles.locationName}>Downtown Terminal</StyledText>
            <StyledText variant='caption' style={styles.locationAddress}>
              456 Oak Ave
            </StyledText>
          </View>
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
  routeRow: {
    flexDirection: 'row',
    gap: spacings.md,
  },
  timeline: {
    alignItems: 'center',
    paddingVertical: spacings.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.primaryTint,
  },
  locations: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacings.xs,
  },
  locationItem: {
    gap: spacings.xs,
  },
  locationName: {
    fontSize: 15,
    fontFamily: 'RubikMedium',
    color: colors.text,
  },
  locationAddress: {
    color: colors.placeholderText,
  },
}));

export default TripTab;
