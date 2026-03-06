import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Joystick } from '@/components/joystick/joystick';
import { CreateNoteOverlay, type CreateNoteOverlayHandle } from '@/components/notes/new-note-text-overlay';
import { CreatePictureOverlay, type CreatePictureOverlayHandle } from '@/components/notes/new-note-picture-overlay';
import { NotesList } from '@/components/notes/notes-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNotes } from '@/hooks/use-notes';

export default function HomeScreen() {
  const { notes, loading, refresh } = useNotes();
  const [showCreate, setShowCreate] = useState(false);
  const overlayRef = useRef<CreateNoteOverlayHandle>(null);
  const [showPicture, setShowPicture] = useState(false);
  const pictureRef = useRef<CreatePictureOverlayHandle>(null);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>tmp</ThemedText>
        </ThemedView>
        
        <NotesList notes={notes} loading={loading} />
      </SafeAreaView>

      <View style={styles.joystickArea}>
        <Joystick
          onActionPreview={(dir) => {
            if (dir === 'up') setShowCreate(true);
            if (dir === 'right') setShowPicture(true);
          }}
          onAction={(dir) => {
            if (dir === 'up') overlayRef.current?.focus();
            if (dir === 'right') pictureRef.current?.shoot();
          }}
          onActionCancel={(dir) => {
            if (dir === 'up') overlayRef.current?.dismiss();
            if (dir === 'right') pictureRef.current?.dismiss();
          }}
        />
      </View>

      {showCreate && (
        <CreateNoteOverlay
          ref={overlayRef}
          onDismiss={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); refresh(); }}
        />
      )}
      {showPicture && (
        <CreatePictureOverlay
          ref={pictureRef}
          onDismiss={() => setShowPicture(false)}
          onCreated={() => { setShowPicture(false); refresh(); }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  joystickArea: {
    position: 'absolute',
    bottom: BottomTabInset + Spacing.four,
    left: 0,
    right: 0,
    alignItems: 'center',
    overflow: 'visible',
  },
});
