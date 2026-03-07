import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Note } from '@/db';
import { useTheme } from '@/hooks/use-theme';
import { useState } from 'react';

const AUDIO_COLOR = '#9B5DE5';

interface NoteCardProps {
  note: Note;
}

function AudioNoteCard({ note }: NoteCardProps) {
  const theme = useTheme();
  const player = useAudioPlayer(note.mediaUri ?? '');
  const status = useAudioPlayerStatus(player);
  const [trackWidth, setTrackWidth] = useState(1);

  const didFinish = !status.playing && status.duration > 0 && status.currentTime >= status.duration - 0.1;
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  function handlePlayPause() {
    if (didFinish) {
      player.seekTo(0).then(() => player.play());
    } else if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  function seekToFraction(locationX: number) {
    if (status.duration <= 0) return;
    const fraction = Math.max(0, Math.min(1, locationX / trackWidth));
    player.seekTo(fraction * status.duration);
  }

  const meta = (
    <ThemedText type="small" style={{ color: theme.textSecondary }}>
      {note.isPinned ? '📌 ' : ''}audio · {note.updatedAt.toLocaleDateString()}
    </ThemedText>
  );

  return (
    <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.audioRow}>
        <Pressable onPress={handlePlayPause} hitSlop={8}>
          <ThemedText style={[styles.playIcon, { color: AUDIO_COLOR }]}>
            {didFinish ? '↺' : status.playing ? '⏸' : '▶'}
          </ThemedText>
        </Pressable>
        <View
          style={styles.progressTrack}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => status.isLoaded}
          onResponderGrant={(e) => seekToFraction(e.nativeEvent.locationX)}
          onResponderMove={(e) => seekToFraction(e.nativeEvent.locationX)}
        >
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      {meta}
    </ThemedView>
  );
}

function PictureNoteCard({ note }: NoteCardProps) {
  const theme = useTheme();
  const meta = (
    <ThemedText type="small" style={{ color: theme.textSecondary }}>
      {note.isPinned ? '📌 ' : ''}picture · {note.updatedAt.toLocaleDateString()}
    </ThemedText>
  );
  return (
    <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.pictureRow}>
        <Image source={{ uri: note.mediaUri ?? '' }} style={styles.thumbnail} contentFit="cover" />
        <View style={styles.pictureMeta}>
          {meta}
        </View>
      </View>
    </ThemedView>
  );
}

function TextNoteCard({ note }: NoteCardProps) {
  const theme = useTheme();
  const meta = (
    <ThemedText type="small" style={{ color: theme.textSecondary }}>
      {note.isPinned ? '📌 ' : ''}text · {note.updatedAt.toLocaleDateString()}
    </ThemedText>
  );
  return (
    <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText numberOfLines={3}>{note.text || '—'}</ThemedText>
      {meta}
    </ThemedView>
  );
}

export function NoteCard({ note }: NoteCardProps) {
  if (note.type === 'audio') return <AudioNoteCard note={note} />;
  if (note.type === 'picture') return <PictureNoteCard note={note} />;
  return <TextNoteCard note={note} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  pictureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  thumbnail: {
    width: Spacing.six,
    height: Spacing.six,
    borderRadius: Spacing.one,
  },
  pictureMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  playIcon: {
    fontSize: 24,
    lineHeight: 32,
    width: 32,
    textAlign: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(155,93,229,0.15)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: AUDIO_COLOR,
  },
});
