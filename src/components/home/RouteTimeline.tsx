import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Stop = {
  name: string;
  address: string;
};

type RouteTimelineProps = {
  stops: Stop[];
};

const RouteTimeline = ({ stops }: RouteTimelineProps) => {
  return (
    <View style={styles.routeRow}>
      <View style={styles.timeline}>
        {stops.map((_, index) => (
          <View key={index}>
            <View style={styles.dot} />
            {index < stops.length - 1 && <View style={styles.line} />}
          </View>
        ))}
      </View>
      <View style={styles.locations}>
        {stops.map((stop, index) => (
          <View key={index} style={styles.locationItem}>
            <StyledText style={styles.locationName}>{stop.name}</StyledText>
            <StyledText variant='caption' style={styles.locationAddress}>
              {stop.address}
            </StyledText>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
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
    height: 60,
    backgroundColor: colors.primaryTint,
    alignSelf: 'center',
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

export default RouteTimeline;
