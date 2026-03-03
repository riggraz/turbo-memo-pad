import { FlatList, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { Note } from '@/db';

import { NoteCard } from './note-card';

interface NotesListProps {
  notes: Note[];
  loading: boolean;
}

export function NotesList({ notes, loading }: NotesListProps) {

  return (
    <FlatList
      data={notes}
      keyExtractor={item => String(item.id)}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        loading ? null : (
          <ThemedText type="small" style={styles.empty}>No notes yet</ThemedText>
        )
      }
      renderItem={({ item }) => <NoteCard note={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    alignSelf: 'stretch',
  },
  content: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  empty: {
    textAlign: 'center',
    paddingTop: Spacing.four,
  },
});
