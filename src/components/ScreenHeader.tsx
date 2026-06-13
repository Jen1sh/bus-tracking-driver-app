import { spacings } from '@/unistyles/tokens';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Platform, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, withUnistyles } from 'react-native-unistyles';
import { StyledText } from './styled/StyledText';

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
};

const UniIcon = withUnistyles(Ionicons, ({ colors, fonts, spacings }) => ({ color: colors.text }));

const ScreenHeader = ({ title, onBack, theme }: ScreenHeaderProps & { theme: any }) => {
  const router = useRouter();
  const icon = Platform.select({ ios: 'chevron-back', default: 'arrow-back' });

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + spacings.sm }]}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onBack ?? (() => router.back())} style={styles.backBtn}>
          <UniIcon name={icon} size={24} />
        </TouchableOpacity>
        <StyledText style={styles.title}>{title}</StyledText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  wrapper: {
    backgroundColor: colors.background,
    paddingHorizontal: spacings.md,
    paddingBottom: spacings.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: spacings.sm,
    padding: spacings.xs,
  },
  title: {
    fontSize: 20,
    fontFamily: 'RubikSemiBold',
    color: colors.text,
  },
}));

export default withUnistyles(ScreenHeader);
