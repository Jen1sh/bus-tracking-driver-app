import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type NextStopCardProps = {
  stopName: string;
  eta: string;
  address: string;
};

const NextStopCard = ({ stopName, eta, address }: NextStopCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <StyledText style={styles.label}>NEXT STOP</StyledText>
        <View style={styles.etaBadge}>
          <Ionicons name='time-outline' size={14} color={styles.etaText.color} />
          <StyledText style={styles.etaText}>{eta}</StyledText>
        </View>
      </View>
      <View style={styles.stopRow}>
        <View style={styles.dot} />
        <View style={styles.stopInfo}>
          <StyledText style={styles.stopName}>{stopName}</StyledText>
          <StyledText style={styles.address}>{address}</StyledText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacings.lg,
    gap: spacings.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
    letterSpacing: 1,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint + '20',
    paddingHorizontal: spacings.sm,
    paddingVertical: spacings.xs,
    borderRadius: 12,
    gap: spacings.xs,
  },
  etaText: {
    fontSize: 12,
    fontFamily: 'RubikSemiBold',
    color: colors.primaryTint,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacings.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    marginTop: 4,
  },
  stopInfo: {
    flex: 1,
    gap: spacings.xs,
  },
  stopName: {
    fontSize: 16,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  address: {
    fontSize: 13,
    fontFamily: 'RubikLight',
    color: colors.placeholderText,
  },
}));

export default NextStopCard;
