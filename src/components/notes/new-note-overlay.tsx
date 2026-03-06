import { forwardRef, useEffect, useImperativeHandle, type ReactNode } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface CreateOverlayHandle {
  dismiss: () => void;
  activate: () => void;
}

interface CreateOverlayProps {
  onDismiss: () => void;
  onActivate?: () => void;
  children: ReactNode;
}

export const CreateOverlay = forwardRef<CreateOverlayHandle, CreateOverlayProps>(
function CreateOverlay({ onDismiss, onActivate, children }, ref) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const translateX = useSharedValue(-width);
  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    backdropOpacity.value = withTiming(1, { duration: 100 });
    translateX.value = withSpring(0, { damping: 16, stiffness: 300, mass: 0.5 });
    scale.value = withSpring(1.05, { damping: 16, stiffness: 300, mass: 0.5 });
  }, []);

  function handleDismiss() {
    backdropOpacity.value = withTiming(0, { duration: 100 });
    translateX.value = withTiming(width, { duration: 100 }, () => {
      'worklet';
      scheduleOnRN(onDismiss);
    });
  }

  function handleActivate() {
    scale.value = withSpring(1, { damping: 16, stiffness: 500, mass: 0.5 });
    if (onActivate) onActivate();
  }

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0,0,0,${backdropOpacity.value * 0.4})`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  useImperativeHandle(ref, () => ({
    dismiss: handleDismiss,
    activate: handleActivate,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
      </Animated.View>
      <Animated.View style={cardAnimStyle}>
        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          {children}
        </ThemedView>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: Spacing.four,
    marginBottom: Spacing.six,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
