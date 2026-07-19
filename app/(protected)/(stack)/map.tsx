import MapBottomSheet from '@/components/map/MapBottomSheet';
import NextStopCard from '@/components/map/NextStopCard';
import SosButton from '@/components/map/SosButton';
import StatCard from '@/components/map/MetricsCard';
import { StyledText } from '@/components/styled/StyledText';
import useTrip from '@/hooks/use-trip';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const TRIP_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: '#bdbdbd' },
  ACTIVE: { label: 'Active', color: '#228B22' },
  COMPLETED: { label: 'Completed', color: '#02384A' },
};

const MapScreen = () => {
  const sheetRef = useRef<TrueSheet>(null);
  const { useNextScheduleSummary } = useTrip();
  const { data: summary } = useNextScheduleSummary();
  const { theme } = useUnistyles();
  const { colors } = theme;
  const router = useRouter();
  const [isTripStarted, setIsTripStarted] = useState(false);

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.present(1);
    }
  }, []);

  if (!summary) return null;

  const route = summary.route;
  const statusInfo = TRIP_STATUS_LABELS[summary.trip.status] ?? TRIP_STATUS_LABELS.PENDING;

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.badgeRow, { backgroundColor: colors.background }]}>
        <View style={[styles.badge, { backgroundColor: statusInfo.color + '20' }]}>
          <View style={[styles.badgeDot, { backgroundColor: statusInfo.color }]} />
          <StyledText style={[styles.badgeText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </StyledText>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.primaryTint + '20' }]}>
          <StyledText style={[styles.badgeText, { color: colors.primaryTint }]}>
            {route.name}
          </StyledText>
        </View>
      </View>

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPanDrag={() => sheetRef.current?.dismiss()}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => sheetRef.current?.present(1)}>
        <StyledText style={styles.fabIcon}>↑</StyledText>
      </TouchableOpacity>

      <MapBottomSheet ref={sheetRef}>
        <View style={styles.statsRow}>
          <StatCard icon='speedometer-outline' value={42} unit='km/h' />
          <StatCard icon='people-outline' value={18} unit='on board' />
        </View>

        <NextStopCard stopName='Main Street Station' eta='5 min' address='123 Main St, Downtown' />

        <TouchableOpacity
          style={[styles.viewAllBtn, { borderColor: colors.border }]}
          onPress={() => {
            sheetRef.current?.dismiss();
            router.push('/(protected)/(stack)/attendees');
          }}
          activeOpacity={0.7}>
          <StyledText style={[styles.viewAllText, { color: colors.primary }]}>
            View All Attendees
          </StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, isTripStarted ? styles.stopBtn : styles.startBtn]}
          onPress={() => setIsTripStarted(!isTripStarted)}
          activeOpacity={0.7}>
          <StyledText style={styles.btnLabel}>
            {isTripStarted ? 'End Trip' : 'Start Trip'}
          </StyledText>
        </TouchableOpacity>

        <SosButton />
      </MapBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  badgeRow: {
    flexDirection: 'row',
    paddingHorizontal: spacings.md,
    paddingVertical: 10,
    gap: spacings.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'RubikSemiBold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 20,
    color: colors.light,
    fontFamily: 'RubikBold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtn: {
    backgroundColor: colors.primary,
  },
  stopBtn: {
    backgroundColor: colors.secondary,
  },
  btnLabel: {
    fontSize: 15,
    fontFamily: 'RubikSemiBold',
    color: colors.light,
  },
  viewAllBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'RubikMedium',
  },
}));

export default MapScreen;
