import { StyledText } from '@/components/styled/StyledText';
import { useCallback, useRef } from 'react';
import { Alert, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const HOLD_DURATION = 3000;

const SosButton = () => {
  const {
    theme: { colors },
  } = useUnistyles();
  const progress = useSharedValue(0);
  const isActive = useRef(false);

  const triggerEmergency = useCallback(() => {
    Alert.alert('Emergency Alert', 'Emergency alert sent to School & Control Room.', [
      { text: 'OK' },
    ]);
  }, []);

  const finishHold = useCallback(() => {
    if (isActive.current) {
      isActive.current = false;
      triggerEmergency();
    }
  }, [triggerEmergency]);

  const longPress = Gesture.LongPress()
    .minDuration(HOLD_DURATION)
    .onBegin(() => {
      isActive.current = true;
      progress.value = withTiming(1, {
        duration: HOLD_DURATION,
        easing: Easing.linear,
      });
    })
    .onFinalize(() => {
      runOnJS(finishHold)();
      progress.value = withTiming(0, { duration: 200 });
    });

  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(progress.value, [0, 1], ['0%', '100%']);
    return { width };
  });

  return (
    <GestureDetector gesture={longPress}>
      <Animated.View style={styles.wrapper}>
        <View style={styles.button}>
          <View style={[styles.barBg, { backgroundColor: colors.error + '20' }]}>
            <Animated.View
              style={[styles.barFill, { backgroundColor: colors.error }, progressStyle]}
            />
          </View>
          <View style={styles.content}>
            <StyledText style={styles.title}>Emergency</StyledText>
            <StyledText style={styles.caption}>
              Hold for Emergency {'\u2022'} Alerts School & Control Room
            </StyledText>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create(({ colors, spacings }) => ({
  wrapper: {
    alignItems: 'stretch',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.error + '30',
  },
  barBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    borderRadius: 12,
  },
  barFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 12,
  },
  content: {
    paddingVertical: spacings.md,
    paddingHorizontal: spacings.md,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: 'RubikSemiBold',
    color: colors.error,
  },
  caption: {
    fontSize: 11,
    fontFamily: 'RubikMedium',
    color: colors.error + 'cc',
    textAlign: 'center',
  },
}));

export default SosButton;
