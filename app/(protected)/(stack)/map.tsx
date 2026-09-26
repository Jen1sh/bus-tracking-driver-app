import TripControl from '@/components/home/TripControl';
import MapBottomSheet from '@/components/map/MapBottomSheet';
import StatCard from '@/components/map/MetricsCard';
import NextStopCard from '@/components/map/NextStopCard';
import SosButton from '@/components/map/SosButton';
import { StyledText } from '@/components/styled/StyledText';
import useDriver from '@/hooks/use-driver';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const FALLBACK_REGION = {
  latitude: 27.7172,
  longitude: 85.324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MapScreen = () => {
  const sheetRef = useRef<TrueSheet>(null);
  const { useAssignment, useCurrentTrip, useSchedule } = useDriver();
  const { data: assignment, isLoading } = useAssignment();
  const { data: trip } = useCurrentTrip();
  // Only used to word the button's empty state. Already cached by Home and the Schedule tab, so this
  // normally costs no extra request.
  const { data: schedule } = useSchedule();
  const {
    theme: { colors },
  } = useUnistyles();
  const router = useRouter();

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.present(1);
    }
  }, []);

  // `lastLocation` is scoped to the current trip and is for rehydration only — it is the bus's last
  // reported position, not a live feed. The live speed and position come from the phone's own GPS.
  const lastLocation = trip?.lastLocation;
  const region = lastLocation
    ? {
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        latitudeDelta: FALLBACK_REGION.latitudeDelta,
        longitudeDelta: FALLBACK_REGION.longitudeDelta,
      }
    : FALLBACK_REGION;

  if (isLoading || !assignment) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  const routeName = trip?.routeName ?? assignment.routeName;

  return (
    <View style={styles.container}>
      <View style={[styles.badgeRow, { backgroundColor: colors.background }]}>
        <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
          <View style={[styles.badgeDot, { backgroundColor: colors.success }]} />
          <StyledText style={[styles.badgeText, { color: colors.success }]}>
            {trip ? 'In progress' : assignment.tripId ? 'Not started' : 'No run today'}
          </StyledText>
        </View>
        {routeName ? (
          <View style={[styles.badge, { backgroundColor: colors.primaryTint + '20' }]}>
            <StyledText style={[styles.badgeText, { color: colors.primaryTint }]}>
              {routeName}
            </StyledText>
          </View>
        ) : null}
      </View>

      <MapView
        style={styles.map}
        initialRegion={region}
        onPanDrag={() => sheetRef.current?.dismiss()}
        showsUserLocation
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => sheetRef.current?.present(1)}>
        <StyledText style={styles.fabIcon}>↑</StyledText>
      </TouchableOpacity>

      <MapBottomSheet ref={sheetRef}>
        <View style={styles.statsRow}>
          {/* Speed comes from the device's own GPS while driving; the server has no live feed to read. */}
          <StatCard
            icon='speedometer-outline'
            value={lastLocation?.speed != null ? Math.round(lastLocation.speed) : '--'}
            unit='km/h'
          />
          <StatCard icon='people-outline' value={trip?.onBoard ?? 0} unit='on board' />
        </View>

        <NextStopCard
          stopName={trip?.nextStop.label ?? 'Awaiting route'}
          eta={trip?.nextStop.etaMinutes != null ? `${trip.nextStop.etaMinutes} min` : '--'}
          address={
            trip?.nextStop.stopId != null
              ? 'Next checkpoint on this route'
              : 'Heading to the school'
          }
        />

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

        {/* The same control as Home, driven by the same server payload — a second local copy here
            would drift out of sync with the dashboard and offer a Start on a running trip. */}
        <TripControl assignment={assignment} hasUpcomingRun={schedule?.next != null} />

        <SosButton />
      </MapBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
