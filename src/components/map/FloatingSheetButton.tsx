import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type FloatingSheetButtonProps = {
  onPress: () => void;
};

const FloatingSheetButton = ({ onPress }: FloatingSheetButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.button, styles.buttonPrimary]}>
      <Ionicons name='map-outline' size={22} color={styles.icon.color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  button: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  icon: {
    color: colors.light,
  },
}));

export default FloatingSheetButton;
