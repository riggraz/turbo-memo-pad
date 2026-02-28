import * as SQLite from 'expo-sqlite';
import { CREATE_INDEXES, CREATE_NOTES_TABLE, SCHEMA_VERSION } from '@/db/schema';

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the open database, creating and migrating it on the first call.
 * All subsequent calls return the same instance (singleton).
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  const db = await SQLite.openDatabaseAsync('turbo-memo-pad.db');
  await runMigrations(db);
  _db = db;
  return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) return;

  if (currentVersion < 1) {
    await db.execAsync(CREATE_NOTES_TABLE);
    await db.execAsync(CREATE_INDEXES);
  }

  // Future migrations:
  // if (currentVersion < 2) { await db.execAsync('ALTER TABLE notes ADD COLUMN ...'); }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}
