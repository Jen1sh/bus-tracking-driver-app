import { StyledText } from '@/components/styled/StyledText';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { forwardRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AttendeesTab from './AttendeesTab';
import TripTab from './TripTab';

type Tab = 'trip' | 'attendees';

const MapBottomSheet = forwardRef<TrueSheet>((_props, ref) => {
  const { theme } = useUnistyles();
  const { colors } = theme;
  const [activeTab, setActiveTab] = useState<Tab>('trip');

  return (
    <TrueSheet ref={ref} detents={[0.4, 0.85]} grabber backgroundColor={colors.background}>
      <View style={styles.sheetContent}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.tabPill,
              activeTab === 'trip' ? styles.tabPillActive : styles.tabPillInactive,
            ]}
            onPress={() => setActiveTab('trip')}>
            <StyledText
              style={activeTab === 'trip' ? styles.tabTextActive : styles.tabTextInactive}>
              Trip
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.tabPill,
              activeTab === 'attendees' ? styles.tabPillActive : styles.tabPillInactive,
            ]}
            onPress={() => setActiveTab('attendees')}>
            <StyledText
              style={activeTab === 'attendees' ? styles.tabTextActive : styles.tabTextInactive}>
              Attendees
            </StyledText>
          </TouchableOpacity>
        </View>

        {activeTab === 'trip' ? <TripTab /> : <AttendeesTab />}
      </View>
    </TrueSheet>
  );
});

MapBottomSheet.displayName = 'MapBottomSheet';

const styles = StyleSheet.create(({ colors, spacings }) => ({
  sheetContent: {
    flexGrow: 1,
    paddingTop: 24,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacings.md,
    paddingTop: spacings.sm,
    gap: spacings.sm,
  },
  tabPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacings.sm,
    borderRadius: 20,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabPillInactive: {
    backgroundColor: colors.surface,
  },
  tabTextActive: {
    color: colors.light,
  },
  tabTextInactive: {
    color: colors.text,
  },
}));

export default MapBottomSheet;
