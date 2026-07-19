import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { forwardRef, PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const MapBottomSheet = forwardRef<TrueSheet, PropsWithChildren>(({ children }, ref) => {
  const { theme } = useUnistyles();
  const { colors } = theme;

  return (
    <TrueSheet
      ref={ref}
      detents={[0.35, 0.85]}
      scrollable
      grabber
      backgroundColor={colors.background}
      cornerRadius={12}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        nestedScrollEnabled>
        {children}
      </ScrollView>
    </TrueSheet>
  );
});

MapBottomSheet.displayName = 'MapBottomSheet';

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
});

export default MapBottomSheet;
