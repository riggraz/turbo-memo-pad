import { CameraView, useCameraPermissions } from 'expo-camera';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createNote, getDatabase } from '@/db';
import { useTheme } from '@/hooks/use-theme';

export interface NewPictureNoteFormHandle {
  takePicture: () => void;
}

interface NewPictureNoteFormProps {
  onDismiss: () => void;
  onCreated: () => void;
}

export const NewPictureNoteForm = forwardRef<NewPictureNoteFormHandle, NewPictureNoteFormProps>(
function NewPictureNoteForm({ onDismiss, onCreated }, ref) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCapture() {
    if (saving || !cameraReady || !cameraRef.current) return;
    setSaving(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo) { setSaving(false); return; }
      const db = await getDatabase();
      await createNote(db, { type: 'picture', text: '', mediaUri: photo.uri });
      onCreated();
    } catch {
      setSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({
    takePicture: handleCapture,
  }));

  function renderCameraContent() {
    if (!permission) {
      return (
        <View style={styles.permissionContainer}>
          <ActivityIndicator color={theme.text} />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Camera access is required to take picture notes.
          </ThemedText>
          {permission.canAskAgain ? (
            <Pressable onPress={requestPermission} style={styles.permissionButton}>
              <ThemedText type="smallBold" style={{ color: theme.text }}>Grant Permission</ThemedText>
            </Pressable>
          ) : (
            <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              Please enable camera access in Settings.
            </ThemedText>
          )}
        </View>
      );
    }

    return (
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      />
    );
  }

  return (
    <>
      <View style={styles.cameraContainer}>
        {renderCameraContent()}
      </View>
      <ThemedView style={styles.actions}>
        <Pressable onPress={onDismiss}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Cancel</ThemedText>
        </Pressable>
        <Pressable onPress={handleCapture} disabled={!cameraReady || saving || !permission?.granted}>
          <ThemedText
            type="smallBold"
            style={{ color: cameraReady && !saving && permission?.granted ? theme.text : theme.textSecondary }}
          >
            {saving ? 'Saving…' : 'Capture'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </>
  );
});

const styles = StyleSheet.create({
  cameraContainer: {
    height: 300,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
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
