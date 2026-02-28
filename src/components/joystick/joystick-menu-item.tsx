import { StyleSheet } from 'react-native';
import Animated, {
  DerivedValue,
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

export type Direction = 'up' | 'left' | 'right' | 'down';

export type DirectionConfig = {
  id: Direction;
  label: string;
  emoji: string;
  color: string;
  offsetX: number;
  offsetY: number;
  angle: number;
};

type Props = {
  dir: DirectionConfig;
  itemBase: number;
  itemSize: number;
  isOpen: SharedValue<boolean>;
  activeDirection: DerivedValue<Direction | null>;
};

const springConfig = { damping: 22, stiffness: 500, mass: 0.5 };
const openSpring = { damping: 16, stiffness: 500, mass: 0.5 };

function getLabelPosition(_id: Direction, _itemSize: number): object {
  return { top: -24, left: '50%', transform: [{ translateX: -36 }], width: 72, textAlign: 'center' as const };
}

export function JoystickMenuItem({ dir, itemBase, itemSize, isOpen, activeDirection }: Props) {
  const theme = useTheme();

  const itemStyle = useAnimatedStyle(() => {
    const open = isOpen.value;
    const isActive = activeDirection.value === dir.id;
    return {
      opacity: withSpring(open ? 1 : 0, springConfig),
      transform: [
        { translateX: withSpring(open ? dir.offsetX : 0, open ? openSpring : springConfig) },
        { translateY: withSpring(open ? dir.offsetY : 0, open ? openSpring : springConfig) },
        { scale: withSpring(isActive ? 1.5 : open ? 1 : 0.1, springConfig) },
      ],
      backgroundColor: isActive ? dir.color : theme.backgroundElement,
      borderColor: isActive ? dir.color : theme.backgroundSelected,
      shadowColor: dir.color,
      shadowOpacity: isActive ? 1 : 0,
      shadowRadius: isActive ? 128 : 0,
      elevation: isActive ? 20 : 0,
    };
  });

  const labelStyle = useAnimatedStyle(() => ({
    color: activeDirection.value === dir.id ? dir.color : (theme.textSecondary as string)
  }));

  return (
    <Animated.View
      style={[
        styles.item,
        { top: itemBase, left: itemBase, width: itemSize, height: itemSize, borderRadius: itemSize / 2 },
        itemStyle,
      ]}>
      <Animated.Text style={styles.emoji}>{dir.emoji}</Animated.Text>
      <Animated.Text
        style={[
          styles.label,
          { position: 'absolute', ...getLabelPosition(dir.id, itemSize) },
          labelStyle,
        ]}>
        {dir.label}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
