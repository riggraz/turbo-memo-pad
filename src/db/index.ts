export { getDatabase } from '@/db/database';
export {
  type CreateNoteInput,
  type Note,
  type NoteRow,
  type NoteType,
  type UpdateNoteInput,
  rowToNote,
} from '@/db/note';
export {
  createNote,
  deleteNote,
  getAllNotes,
  getNoteById,
  searchNotes,
  updateNote,
} from '@/db/note.repository';
