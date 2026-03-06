import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createNote, getDatabase } from '@/db';
import { useTheme } from '@/hooks/use-theme';

export interface NewTextNoteFormHandle {
  focus: () => void;
}

interface NewTextNoteFormProps {
  onDismiss: () => void;
  onCreated: () => void;
}

export const NewTextNoteForm = forwardRef<NewTextNoteFormHandle, NewTextNoteFormProps>(
function NewTextNoteForm({ onDismiss, onCreated }, ref) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!text.trim() || saving) return;
    setSaving(true);
    const db = await getDatabase();
    await createNote(db, { type: 'text', text: text.trim() });
    onCreated();
  }

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  return (
    <>
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
        <Pressable onPress={onDismiss}>
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
    </>
  );
});

const styles = StyleSheet.create({
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
