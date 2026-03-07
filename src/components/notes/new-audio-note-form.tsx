import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import type { PermissionResponse } from 'expo-audio';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createNote, getDatabase } from '@/db';
import { useTheme } from '@/hooks/use-theme';

export interface NewAudioNoteFormHandle {
  startRecording: () => Promise<void>;
  stopAndSave: () => Promise<void>;
  stopAndDiscard: () => Promise<void>;
  markIdle: () => void;
  isRecording: () => boolean;
  getDurationSeconds: () => number;
}

interface NewAudioNoteFormProps {
  onDismiss: () => void;
  onCreated: () => void;
}

function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const NewAudioNoteForm = forwardRef<NewAudioNoteFormHandle, NewAudioNoteFormProps>(
function NewAudioNoteForm({ onDismiss, onCreated }, ref) {
  const theme = useTheme();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 1000);
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [displayHint, setDisplayHint] = useState<'starting' | 'idle'>('starting');
  const dotOpacity = useSharedValue(1);
  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  useEffect(() => {
    let cancelled = false;
    getRecordingPermissionsAsync().then((perm) => {
      if (!cancelled) setPermission(perm);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (recorderState.isRecording) {
      dotOpacity.value = withRepeat(withTiming(0, { duration: 600 }), -1, true);
    } else {
      dotOpacity.value = 1;
    }
  }, [recorderState.isRecording]);

  function markIdle() {
    setDisplayHint('idle');
  }

  async function doStartRecording() {
    if (recorder.isRecording) return;
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      setDisplayHint('idle');
    }
  }

  async function handleRequestPermission() {
    const result = await requestRecordingPermissionsAsync();
    setPermission(result);
  }

  async function stopAndSave() {
    if (!recorder.isRecording) return;
    setSaving(true);
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) { setSaving(false); return; }
      const db = await getDatabase();
      await createNote(db, { type: 'audio', text: '', mediaUri: uri });
      onCreated();
    } catch {
      setSaving(false);
    }
  }

  async function stopAndDiscard() {
    try {
      if (recorder.isRecording) await recorder.stop();
    } catch {
      // ignore stop errors on discard
    }
    onDismiss();
  }

  useImperativeHandle(ref, () => ({
    startRecording: doStartRecording,
    stopAndSave,
    stopAndDiscard,
    markIdle,
    isRecording: () => recorder.isRecording,
    getDurationSeconds: () => Math.floor(recorder.currentTime),
  }));

  function renderContent() {
    if (!permission) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator color={theme.text} />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.contentContainer}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Microphone access is required to record audio notes.
          </ThemedText>
          {permission.canAskAgain ? (
            <Pressable onPress={handleRequestPermission} style={styles.permissionButton}>
              <ThemedText type="smallBold" style={{ color: theme.text }}>Grant Permission</ThemedText>
            </Pressable>
          ) : (
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              Please enable microphone access in Settings.
            </ThemedText>
          )}
        </View>
      );
    }

    if (!recorderState.isRecording) {
      return (
        <View style={styles.contentContainer}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            {displayHint === 'starting' ? 'Starting recording…' : 'Press record to start'}
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.timerRow}>
          <Animated.View style={[styles.recordingDot, dotStyle]} />
          <ThemedText style={[styles.timerText, { color: theme.text }]}>
            {formatDuration(recorderState.durationMillis)}
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <>
      {renderContent()}
      <ThemedView style={styles.actions}>
        <Pressable onPress={stopAndDiscard}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Cancel</ThemedText>
        </Pressable>
        {saving ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Saving…</ThemedText>
        ) : !recorderState.isRecording && permission?.granted && displayHint === 'idle' ? (
          <Pressable onPress={doStartRecording}>
            <ThemedText type="smallBold" style={{ color: theme.text }}>Record</ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>
    </>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9B5DE5',
  },
  timerText: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '600',
  },
  permissionButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
});
