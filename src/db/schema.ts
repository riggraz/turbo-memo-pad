export const SCHEMA_VERSION = 1;

export const CREATE_NOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT NOT NULL DEFAULT 'text' CHECK(type IN ('text', 'audio', 'picture')),
    text        TEXT NOT NULL DEFAULT '',
    media_uri   TEXT,
    is_pinned   INTEGER NOT NULL DEFAULT 0 CHECK(is_pinned IN (0, 1)),
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
  );
`;

export const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_notes_is_pinned  ON notes (is_pinned DESC, updated_at DESC);
`;
