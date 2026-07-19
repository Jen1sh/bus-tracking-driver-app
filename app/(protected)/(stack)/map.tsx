import FloatingSheetButton from '@/components/map/FloatingSheetButton';
import MapBottomSheet from '@/components/map/MapBottomSheet';
import useTrip from '@/hooks/use-trip';
import { TripStatus } from '@/types/enums';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import MapView from 'react-native-maps';

const MapScreen = () => {
  const sheetRef = useRef<TrueSheet>(null);
  const {
    useStartTrip,
    useEndTrip,
    useNextScheduleSummary,
    useNextScheduleAttendees,
    isTracking,
    stopTracking,
  } = useTrip();
  const { data: summary, isLoading: summaryLoading } = useNextScheduleSummary();
  const { data: attendees } = useNextScheduleAttendees();
  const { mutate: startTrip, isPending: isStartLoading } = useStartTrip();
  const { mutate: endTrip, isPending: isEndLoading } = useEndTrip();

  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.present(1);
    }
  }, []);

  useEffect(() => {
    if (!summary) return;

    if (summary.trip.status !== TripStatus.ACTIVE && isTracking) {
      stopTracking();
    }
  }, [summary, isTracking, stopTracking]);

  return (
    <View style={{ flex: 1 }}>
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

      <FloatingSheetButton onPress={() => sheetRef.current?.present(1)} />

      <MapBottomSheet
        ref={sheetRef}
        summary={summary ?? null}
        attendees={attendees ?? null}
        isLoading={summaryLoading}
        isStartLoading={isStartLoading}
        isEndLoading={isEndLoading}
        onStartTrip={() => startTrip()}
        onEndTrip={() => endTrip()}
      />
    </View>
  );
};

export default MapScreen;
