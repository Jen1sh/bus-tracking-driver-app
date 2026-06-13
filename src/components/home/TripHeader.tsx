import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type TripHeaderProps = {
  busNumber: string;
  scheduledTime: string;
  label: string;
};

const TripHeader = ({ busNumber, scheduledTime, label }: TripHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <StyledText variant='caption' style={styles.label}>
          {label}
        </StyledText>
        <View style={styles.busBadge}>
          <StyledText style={styles.busBadgeText}>{busNumber}</StyledText>
        </View>
      </View>
      <StyledText style={styles.time}>{scheduledTime}</StyledText>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    gap: spacings.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    letterSpacing: 1.2,
  },
  busBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.xs,
    borderRadius: 8,
  },
  busBadgeText: {
    fontSize: 13,
    fontFamily: 'RubikMedium',
    color: colors.light,
  },
  time: {
    fontSize: 32,
    fontFamily: 'RubikBold',
    color: colors.primary,
  },
}));

export default TripHeader;
