import { StyledText } from '@/components/styled/StyledText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ProfileHeaderProps = {
  name: string;
  role: string;
  busNumber: string;
};

const ProfileHeader = ({ name, role, busNumber }: ProfileHeaderProps) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <StyledText style={styles.avatarText}>{initials}</StyledText>
      </View>
      <StyledText style={styles.name}>{name}</StyledText>
      <StyledText variant='caption' style={styles.role}>
        {role}
      </StyledText>
      <View style={styles.busBadge}>
        <StyledText style={styles.busBadgeText}>{busNumber}</StyledText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    alignItems: 'center',
    paddingVertical: spacings.xl,
    gap: spacings.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacings.xs,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'RubikBold',
    color: colors.light,
  },
  name: {
    fontSize: 22,
    fontFamily: 'RubikBold',
    color: colors.text,
  },
  role: {
    color: colors.placeholderText,
  },
  busBadge: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacings.md,
    paddingVertical: spacings.xs,
    borderRadius: 12,
    marginTop: spacings.xs,
  },
  busBadgeText: {
    fontSize: 13,
    fontFamily: 'RubikMedium',
    color: colors.light,
  },
}));

export default ProfileHeader;
