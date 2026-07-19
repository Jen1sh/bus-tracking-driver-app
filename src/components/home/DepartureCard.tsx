import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type DepartureCardProps = {
  time: string;
  date: string;
};

const DepartureCard = ({ time, date }: DepartureCardProps) => {
  return (
    <View style={styles.card}>
      <StyledText style={styles.label}>SCHEDULED DEPARTURE</StyledText>
      <View style={styles.timeRow}>
        <Ionicons name='time-outline' size={20} color={styles.icon.color} />
        <StyledText style={styles.time}>{time}</StyledText>
      </View>
      <StyledText style={styles.date}>{date}</StyledText>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacings.md,
    gap: 4,
    marginHorizontal: spacings.md,
  },
  label: {
    fontSize: 10,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    letterSpacing: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.sm,
  },
  icon: {
    color: colors.primary,
  },
  time: {
    fontSize: 22,
    fontFamily: 'RubikBold',
    color: colors.primary,
  },
  date: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
}));

export default DepartureCard;
