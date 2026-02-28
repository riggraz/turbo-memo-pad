import * as Haptics from 'expo-haptics';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  DerivedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/hooks/use-theme';

import { Direction, DirectionConfig, JoystickMenuItem } from './joystick-menu-item';

const OUTER_SIZE = 88;
const INNER_SIZE = 46;
const ITEM_SIZE = 58;
const MENU_RADIUS = 100;
const DEAD_ZONE = 40;
const LONG_PRESS_DURATION = 10;

const ITEM_BASE = OUTER_SIZE / 2 - ITEM_SIZE / 2;
const INNER_BASE = OUTER_SIZE / 2 - INNER_SIZE / 2;
const MAX_INNER_MOVE = OUTER_SIZE / 2 - INNER_SIZE / 2 - 4;

const DIRECTIONS: DirectionConfig[] = [
  { id: 'up',    label: 'Write',   emoji: '✏️', color: '#00C9A7', offsetX: 0,           offsetY: -MENU_RADIUS, angle: -90 },
  { id: 'left',  label: 'Speak',   emoji: '🎙️', color: '#9B5DE5', offsetX: -MENU_RADIUS, offsetY: 0,           angle: 180 },
  { id: 'right', label: 'Picture', emoji: '📸', color: '#F7B731', offsetX: MENU_RADIUS,  offsetY: 0,           angle: 0   },
  { id: 'down',  label: 'Settings',emoji: '⚙️', color: '#F15BB5', offsetX: 0,           offsetY: MENU_RADIUS,  angle: 90  },
];

const springConfig = { damping: 22, stiffness: 500, mass: 0.5 };
const returnSpring = { damping: 20, stiffness: 300, mass: 0.5 };

function getActiveDirection(tx: number, ty: number): Direction | null {
  'worklet';
  const dist = Math.sqrt(tx * tx + ty * ty);
  if (dist < DEAD_ZONE) return null;
  const angle = (Math.atan2(ty, tx) * 180) / Math.PI;
  if (angle > -45 && angle <= 45) return 'right';
  if (angle > 45 && angle <= 135) return 'down';
  if (angle > 135 || angle <= -135) return 'left';
  return 'up';
}

type ConnectorLineProps = {
  dir: DirectionConfig;
  activeDirection: DerivedValue<Direction | null>;
};

function ConnectorLine({ dir, activeDirection }: ConnectorLineProps) {
  const lineStyle = useAnimatedStyle(() => ({
    opacity: withSpring(activeDirection.value === dir.id ? 1 : 0, springConfig),
    backgroundColor: dir.color,
  }));

  return (
    <Animated.View
      style={[
        styles.connectorLine,
        {
          left: OUTER_SIZE / 2,
          top: OUTER_SIZE / 2 - 1,
          width: MENU_RADIUS,
          transform: [{ rotate: `${dir.angle}deg` }],
        },
        lineStyle,
      ]}
    />
  );
}

export function Joystick() {
  const theme = useTheme();

  const isOpen = useSharedValue(false);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const activeDirection = useDerivedValue<Direction | null>(() => {
    if (!isOpen.value) return null;
    return getActiveDirection(translationX.value, translationY.value);
  });

  useAnimatedReaction(
    () => activeDirection.value,
    (current, previous) => {
      if (current !== null && current !== previous) {
        scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
      }
    }
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_DURATION)
    .onStart(() => {
      'worklet';
      isOpen.value = true;
      translationX.value = 0;
      translationY.value = 0;
    })
    .onUpdate((e) => {
      'worklet';
      translationX.value = e.translationX;
      translationY.value = e.translationY;
    })
    .onFinalize(() => {
      'worklet';
      // Action would be triggered here based on activeDirection.value
      isOpen.value = false;
      translationX.value = withSpring(0, returnSpring);
      translationY.value = withSpring(0, returnSpring);
    });

  const outerStyle = useAnimatedStyle(() => ({
    borderColor: theme.backgroundSelected,
    backgroundColor: theme.backgroundElement,
    shadowColor: theme.text,
    shadowOpacity: withSpring(isOpen.value ? 0.18 : 0, springConfig),
    shadowRadius: 20,
  }));

  const innerStyle = useAnimatedStyle(() => {
    const clamp = (v: number) => Math.min(Math.max(v, -MAX_INNER_MOVE), MAX_INNER_MOVE);
    const dx = clamp(translationX.value * 0.3);
    const dy = clamp(translationY.value * 0.3);
    return {
      transform: [
        { translateX: dx },
        { translateY: dy },
        { scale: withSpring(isOpen.value ? 1.15 : 1, springConfig) },
      ],
      shadowOffset: { width: dx * 0.4, height: dy * 0.4 },
      shadowOpacity: withSpring(isOpen.value ? 0.45 : 0, springConfig),
      shadowRadius: withSpring(isOpen.value ? 12 : 4, springConfig),
      elevation: withSpring(isOpen.value ? 12 : 3, springConfig),
    };
  });

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={pan}>
        <View style={styles.gestureArea}>
          {DIRECTIONS.map((dir) => (
            <ConnectorLine key={dir.id} dir={dir} activeDirection={activeDirection} />
          ))}
          {DIRECTIONS.map((dir) => (
            <JoystickMenuItem
              key={dir.id}
              dir={dir}
              itemBase={ITEM_BASE}
              itemSize={ITEM_SIZE}
              isOpen={isOpen}
              activeDirection={activeDirection}
            />
          ))}
          <Animated.View style={[styles.outer, outerStyle]}>
            <Animated.View
              style={[
                styles.inner,
                { top: INNER_BASE, left: INNER_BASE, backgroundColor: theme.text, opacity: 0.7 },
                innerStyle,
              ]}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: OUTER_SIZE,
    overflow: 'visible',
  },
  gestureArea: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    overflow: 'visible',
  },
  outer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    borderWidth: 1.5,
  },
  inner: {
    position: 'absolute',
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    shadowColor: '#000',
  },
  connectorLine: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
});
