import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import MetricCard from './MetricCard';

type RouteShiftCardProps = {
  routeName: string;
  shift: string;
  studentCount: number;
  stopCount: number;
  tripCount: number;
};

const RouteShiftCard = ({
  routeName,
  shift,
  studentCount,
  stopCount,
  tripCount,
}: RouteShiftCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <StyledText style={styles.routeName}>{routeName}</StyledText>
        <StyledText style={styles.shift}>{shift}</StyledText>
      </View>
      <View style={styles.metricsRow}>
        <MetricCard icon='people-outline' label='Students' value={studentCount} />
        <MetricCard icon='location-outline' label='Stops' value={stopCount} />
        <MetricCard icon='swap-horizontal-outline' label='Trips' value={tripCount} />
      </View>
    </View>
  );
};

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
