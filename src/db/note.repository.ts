import type { SQLiteDatabase } from 'expo-sqlite';
import {
  type CreateNoteInput,
  type Note,
  type NoteRow,
  type UpdateNoteInput,
  rowToNote,
} from '@/db/note';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** Returns all notes ordered by pinned-first, then most recently updated. */
export async function getAllNotes(db: SQLiteDatabase): Promise<Note[]> {
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC`
  );
  return rows.map(rowToNote);
}

/** Returns a single note by id, or null if not found. */
export async function getNoteById(db: SQLiteDatabase, id: number): Promise<Note | null> {
  const row = await db.getFirstAsync<NoteRow>(`SELECT * FROM notes WHERE id = ?`, [id]);
  return row ? rowToNote(row) : null;
}

/** LIKE search across text. */
export async function searchNotes(db: SQLiteDatabase, query: string): Promise<Note[]> {
  const term = `%${query}%`;
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM notes WHERE text LIKE ? ORDER BY is_pinned DESC, updated_at DESC`,
    [term]
  );
  return rows.map(rowToNote);
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/** Inserts a new note and returns the fully-hydrated Note. */
export async function createNote(db: SQLiteDatabase, input: CreateNoteInput): Promise<Note> {
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO notes (type, text, media_uri, is_pinned, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.type, input.text, input.mediaUri ?? null, input.isPinned ? 1 : 0, now, now]
  );

  const note = await getNoteById(db, result.lastInsertRowId);
  if (!note) throw new Error(`createNote: could not read back row ${result.lastInsertRowId}`);
  return note;
}

/**
 * Updates the provided fields of an existing note.
 * Always refreshes updated_at. Returns the updated Note, or null if not found.
 */
export async function updateNote(
  db: SQLiteDatabase,
  id: number,
  input: UpdateNoteInput
): Promise<Note | null> {
  const setClauses: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [Date.now()];

  if (input.type !== undefined) {
    setClauses.push('type = ?');
    values.push(input.type);
  }
  if (input.text !== undefined) {
    setClauses.push('text = ?');
    values.push(input.text);
  }
  if (input.mediaUri !== undefined) {
    setClauses.push('media_uri = ?');
    values.push(input.mediaUri);
  }
  if (input.isPinned !== undefined) {
    setClauses.push('is_pinned = ?');
    values.push(input.isPinned ? 1 : 0);
  }

  values.push(id);
  await db.runAsync(`UPDATE notes SET ${setClauses.join(', ')} WHERE id = ?`, values);

  return getNoteById(db, id);
}

/** Deletes a note by id. No-op if the id does not exist. */
export async function deleteNote(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
}
