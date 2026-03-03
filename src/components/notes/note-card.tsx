import { StyleSheet } from 'react-native';

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

  return (
    <ThemedView style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText numberOfLines={3}>{note.text || '—'}</ThemedText>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {note.isPinned ? '📌 ' : ''}{note.type} · {note.updatedAt.toLocaleDateString()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
