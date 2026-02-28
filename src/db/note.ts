export type NoteType = 'text' | 'audio' | 'picture';

/** Raw row shape as returned by expo-sqlite. */
export interface NoteRow {
  id: number;
  type: NoteType;
  text: string;
  media_uri: string | null;
  is_pinned: number; // 0 | 1
  created_at: number; // Unix ms
  updated_at: number; // Unix ms
}

/** App-layer Note type with proper TypeScript primitives. */
export interface Note {
  id: number;
  type: NoteType;
  text: string;
  mediaUri: string | null;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Fields accepted when creating a new note. */
export type CreateNoteInput = Pick<Note, 'type' | 'text'> &
  Partial<Pick<Note, 'mediaUri' | 'isPinned'>>;

/** Fields accepted when updating an existing note — all optional. */
export type UpdateNoteInput = Partial<Pick<Note, 'type' | 'text' | 'mediaUri' | 'isPinned'>>;

/** Converts a raw SQLite NoteRow to the app-layer Note type. */
export function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    type: row.type,
    text: row.text,
    mediaUri: row.media_uri,
    isPinned: row.is_pinned === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
