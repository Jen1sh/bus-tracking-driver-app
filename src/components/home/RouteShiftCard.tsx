import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import MetricCard from './MetricCard';

type RouteShiftCardProps = {
  /** Null when the bus has no route yet — the card still renders. */
  routeName: string | null;
  /** From `direction`, the authoritative run label. Null on a day the bus does not run. */
  directionLabel: string | null;
  studentCount: number;
  stopCount: number;
  /** This bus's runs today — drives the "Run N of M" line. */
  runCount: number;
  /** 1-based index of the run this payload describes, or null when the bus is not running today. */
  currentRunNumber: number | null;
};

const RouteShiftCard = ({
  routeName,
  directionLabel,
  studentCount,
  stopCount,
  runCount,
  currentRunNumber,
}: RouteShiftCardProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <StyledText style={styles.routeName}>{routeName ?? 'No route assigned'}</StyledText>
      {directionLabel ? <StyledText style={styles.shift}>{directionLabel}</StyledText> : null}
    </View>
    <View style={styles.metricsRow}>
      <MetricCard icon='people-outline' label='Students' value={studentCount} />
      <MetricCard icon='location-outline' label='Stops' value={stopCount} />
      <MetricCard
        icon='swap-horizontal-outline'
        label='Trips'
        value={currentRunNumber != null ? `${currentRunNumber} of ${runCount}` : runCount}
      />
    </View>
  </View>
);

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacings.md,
    gap: spacings.sm,
    marginHorizontal: spacings.md,
  },
  header: {
    gap: 2,
  },
  routeName: {
    fontSize: 14,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  shift: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.primaryTint,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacings.sm,
  },
}));

export default RouteShiftCard;
