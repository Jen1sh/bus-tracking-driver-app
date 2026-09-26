import { StyledButton } from '@/components/styled/StyledButton';
import { StyledText } from '@/components/styled/StyledText';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type BusDetailCardProps = {
  displayId: string | null;
  plate: string | null;
  /** The roster size. There is no `capacity` on the driver's payload — this is the count that matters. */
  studentCount: number;
};

const BusDetailCard = ({ displayId, plate, studentCount }: BusDetailCardProps) => {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Ionicons name='bus-outline' size={20} color={styles.icon.color} />
        <View style={styles.info}>
          <StyledText style={styles.plate}>{plate ?? displayId ?? 'Unassigned'}</StyledText>
          <StyledText style={styles.capacity}>
            {displayId ? `${displayId} · ` : ''}
            {studentCount} on roster
          </StyledText>
        </View>
      </View>
      <StyledButton
        title='View on Map'
        icon='map-outline'
        onPress={() => router.push('/(protected)/(stack)/map')}
      />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacings.sm,
  },
  icon: {
    color: colors.primary,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  plate: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  capacity: {
    fontSize: 12,
    fontFamily: 'RubikMedium',
    color: colors.placeholderText,
  },
}));

export default BusDetailCard;
