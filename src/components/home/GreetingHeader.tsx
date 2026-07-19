import { StyledText } from '@/components/styled/StyledText';
import { spacings } from '@/unistyles/tokens';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type GreetingHeaderProps = {
  name: string;
  status: 'on-duty' | 'off-duty';
  topInset?: number;
};

const GreetingHeader = ({ name, status, topInset = 0 }: GreetingHeaderProps) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={[styles.container, { paddingTop: topInset + spacings.sm }]}>
      <View style={styles.avatar}>
        <StyledText style={styles.initials}>{initials}</StyledText>
      </View>
      <View style={styles.textContainer}>
        <StyledText style={styles.greeting}>{greeting},</StyledText>
        <StyledText style={styles.name}>{name}</StyledText>
      </View>
      <View style={[styles.badge, status === 'on-duty' ? styles.badgeOn : styles.badgeOff]}>
        <View style={[styles.dot, status === 'on-duty' ? styles.dotOn : styles.dotOff]} />
        <StyledText style={styles.badgeText}>
          {status === 'on-duty' ? 'On Duty' : 'Off Duty'}
        </StyledText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacings.md,
    paddingBottom: spacings.sm,
    gap: spacings.sm,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 14,
    fontFamily: 'RubikBold',
    color: colors.light,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: colors.placeholderText,
    fontFamily: 'RubikLight',
  },
  name: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  badgeOn: {
    backgroundColor: colors.success + '20',
  },
  badgeOff: {
    backgroundColor: colors.disabled + '30',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOn: {
    backgroundColor: colors.success,
  },
  dotOff: {
    backgroundColor: colors.disabled,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
  },
}));

export default GreetingHeader;
