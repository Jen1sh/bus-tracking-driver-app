import FloatingSheetButton from '@/components/map/FloatingSheetButton';
import MapBottomSheet from '@/components/map/MapBottomSheet';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef } from 'react';
import { View } from 'react-native';
import MapView from 'react-native-maps';

const MapScreen = () => {
  const sheetRef = useRef<TrueSheet>(null);

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

      <MapBottomSheet ref={sheetRef} />
    </View>
  );
};

export default MapScreen;
