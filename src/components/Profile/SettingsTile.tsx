import Ionicons from '@expo/vector-icons/Ionicons';
import React, { ComponentProps } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { StyledText } from '../styled/StyledText';

type SettingTileProps = {
  label: string;
  onPress?: () => void;
  icon: ComponentProps<typeof Ionicons>['name'];
  showChevron?: boolean;
};

const SettingsTile = ({ label, onPress, icon, showChevron = true }: SettingTileProps) => {
  return (
    <TouchableOpacity activeOpacity={0.3} onPress={onPress} style={styles.container}>
      <Ionicons name={icon} size={22} style={styles.icon} />
      <StyledText numberOfLines={1} style={styles.label}>
        {label}
      </StyledText>
      {showChevron && <Ionicons name='chevron-forward' size={18} style={styles.chevron} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create(({ colors }) => ({
  container: {
    gap: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    padding: 10,
    borderRadius: 999,
    color: colors.light,
    backgroundColor: colors.accent,
    overflow: 'hidden',
  },
  label: {
    flex: 1,
    fontSize: 15,
  },
  chevron: {
    color: colors.placeholderText,
  },
}));

export default SettingsTile;
