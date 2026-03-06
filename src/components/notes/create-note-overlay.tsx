import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createNote, getDatabase } from '@/db';
import { useTheme } from '@/hooks/use-theme';

export interface CreateNoteOverlayHandle {
  dismiss: () => void;
  focus: () => void;
}

interface CreateNoteOverlayProps {
  onDismiss: () => void;
  onCreated: () => void;
}

export const CreateNoteOverlay = forwardRef<CreateNoteOverlayHandle, CreateNoteOverlayProps>(
function CreateNoteOverlay({ onDismiss, onCreated }, ref) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

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

  async function handleSave() {
    if (!text.trim() || saving) return;
    setSaving(true);
    const db = await getDatabase();
    await createNote(db, { type: 'text', text: text.trim() });
    onCreated();
  }

  const backdropStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0,0,0,${backdropOpacity.value * 0.4})`,
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  useImperativeHandle(ref, () => ({
    dismiss: handleDismiss,
    focus: () => {
      scale.value = withSpring(1, { damping: 16, stiffness: 500, mass: 0.5 });
      inputRef.current?.focus();
    },
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
      </Animated.View>
      <Animated.View style={cardAnimStyle}>
        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.text }]}
            placeholder="Write a note…"
            placeholderTextColor={theme.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
          />
          <ThemedView style={styles.actions}>
            <Pressable onPress={handleDismiss}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Cancel</ThemedText>
            </Pressable>
            <Pressable onPress={handleSave} disabled={!text.trim() || saving}>
              <ThemedText
                type="smallBold"
                style={{ color: text.trim() && !saving ? theme.text : theme.textSecondary }}
              >
                Save
              </ThemedText>
            </Pressable>
          </ThemedView>
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
  input: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
});
