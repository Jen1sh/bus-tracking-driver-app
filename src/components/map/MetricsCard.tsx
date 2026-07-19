import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  unit: string;
};

const StatCard = ({ icon, value, unit }: StatCardProps) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={20} color={styles.icon.color} />
    <StyledText style={styles.value}>{value}</StyledText>
    <StyledText style={styles.unit}>{unit}</StyledText>
  </View>
);

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacings.md,
    gap: 2,
  },
  icon: {
    color: colors.primary,
  },
  value: {
    fontSize: 24,
    fontFamily: 'RubikBold',
    color: colors.text,
  },
  unit: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    textTransform: 'uppercase',
  },
}));

export default StatCard;
