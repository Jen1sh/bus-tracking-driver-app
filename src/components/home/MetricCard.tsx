import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type MetricCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
};

const MetricCard = ({ icon, label, value }: MetricCardProps) => {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={18} color={styles.icon.color} />
      <StyledText style={styles.value}>{value}</StyledText>
      <StyledText style={styles.label}>{label}</StyledText>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacings.sm,
    paddingHorizontal: spacings.xs,
    borderRadius: 10,
    gap: 2,
  },
  icon: {
    color: colors.primary,
  },
  value: {
    fontSize: 17,
    fontFamily: 'RubikBold',
    color: colors.text,
  },
  label: {
    fontSize: 10,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}));

export default MetricCard;
