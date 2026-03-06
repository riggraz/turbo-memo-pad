import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Note } from '@/db';
import { useTheme } from '@/hooks/use-theme';

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const theme = useTheme();

  const meta = (
    <ThemedText type="small" style={{ color: theme.textSecondary }}>
      {note.isPinned ? '📌 ' : ''}{note.type} · {note.updatedAt.toLocaleDateString()}
    </ThemedText>
  );

  if (note.type === 'picture' && note.mediaUri) {
    return (
      <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
        <View style={styles.pictureRow}>
          <Image source={{ uri: note.mediaUri }} style={styles.thumbnail} contentFit="cover" />
          <View style={styles.pictureMeta}>
            {meta}
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText numberOfLines={3}>{note.text || '—'}</ThemedText>
      {meta}
    </ThemedView>
  );
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
});
