import Ionicons from '@expo/vector-icons/Ionicons';
import { StyledText } from '@/components/styled/StyledText';
import { Linking, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ContactCardProps = {
  phone: string;
};

const ContactCard = ({ phone }: ContactCardProps) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={handleCall} style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name='call-outline' size={22} color={styles.icon.color} />
      </View>
      <View style={styles.textContainer}>
        <StyledText style={styles.title}>Call School Admin</StyledText>
        <StyledText variant='caption' style={styles.subtitle}>
          {phone}
        </StyledText>
      </View>
      <Ionicons name='chevron-forward' size={18} color={styles.chevron.color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacings.md,
    gap: spacings.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.light,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: 'RubikMedium',
    color: colors.text,
  },
  subtitle: {
    color: colors.placeholderText,
  },
  chevron: {
    color: colors.placeholderText,
  },
}));

export default ContactCard;
