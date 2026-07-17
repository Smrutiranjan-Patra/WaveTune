import { requireOptionalNativeModule } from "expo-modules-core";
import type * as SQLite from "expo-sqlite";

const DATABASE_NAME = "wavetune.db";
const MIGRATION_SQL = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY NOT NULL,
    filename TEXT NOT NULL,
    uri TEXT NOT NULL,
    media_type TEXT NOT NULL,
    media_subtypes TEXT NOT NULL DEFAULT '[]',
    width INTEGER NOT NULL DEFAULT 0,
    height INTEGER NOT NULL DEFAULT 0,
    creation_time REAL NOT NULL DEFAULT 0,
    modification_time REAL NOT NULL DEFAULT 0,
    duration REAL NOT NULL DEFAULT 0,
    file_size REAL NOT NULL DEFAULT 0,
    album_id TEXT,
    title TEXT,
    artist TEXT,
    album_title TEXT,
    genre TEXT,
    updated_at REAL NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_songs_filename ON songs(filename);
  CREATE INDEX IF NOT EXISTS idx_songs_album_id ON songs(album_id);

  CREATE TABLE IF NOT EXISTS song_metadata_overrides (
    song_id TEXT PRIMARY KEY NOT NULL,
    title TEXT,
    artist TEXT,
    album_title TEXT,
    genre TEXT,
    updated_at REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorite_songs (
    song_id TEXT PRIMARY KEY NOT NULL,
    created_at REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS playback_history (
    song_id TEXT PRIMARY KEY NOT NULL,
    play_count INTEGER NOT NULL DEFAULT 1,
    last_played_at REAL NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_playback_history_recent
    ON playback_history(last_played_at DESC);

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at REAL NOT NULL,
    updated_at REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id TEXT NOT NULL,
    song_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    added_at REAL NOT NULL,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_playlist_songs_position
    ON playlist_songs(playlist_id, position);
`;

let databasePromise: Promise<SQLite.SQLiteDatabase | null> | null = null;
let syncDatabase: SQLite.SQLiteDatabase | null | undefined;

const songMetadataColumns = [
  ["file_size", "REAL NOT NULL DEFAULT 0"],
  ["title", "TEXT"],
  ["artist", "TEXT"],
  ["album_title", "TEXT"],
  ["genre", "TEXT"],
] as const;

async function migrateSongMetadataColumns(database: SQLite.SQLiteDatabase) {
  const columns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(songs)",
  );
  const existingColumns = new Set(columns.map((column) => column.name));

  for (const [name, type] of songMetadataColumns) {
    if (!existingColumns.has(name)) {
      await database.execAsync(`ALTER TABLE songs ADD COLUMN ${name} ${type}`);
    }
  }
}

function migrateSongMetadataColumnsSync(database: SQLite.SQLiteDatabase) {
  const columns = database.getAllSync<{ name: string }>(
    "PRAGMA table_info(songs)",
  );
  const existingColumns = new Set(columns.map((column) => column.name));

  for (const [name, type] of songMetadataColumns) {
    if (!existingColumns.has(name)) {
      database.execSync(`ALTER TABLE songs ADD COLUMN ${name} ${type}`);
    }
  }
}

async function migrateDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(MIGRATION_SQL);
  await migrateSongMetadataColumns(database);
}

function migrateDatabaseSync(database: SQLite.SQLiteDatabase) {
  database.execSync(MIGRATION_SQL);
  migrateSongMetadataColumnsSync(database);
}

export async function getDatabase() {
  if (!databasePromise) {
    const nativeModule = requireOptionalNativeModule("ExpoSQLite");

    if (!nativeModule) {
      databasePromise = Promise.resolve(null);
      return databasePromise;
    }

    databasePromise = import("expo-sqlite")
      .then(async (SQLiteModule) => {
        const database = await SQLiteModule.openDatabaseAsync(DATABASE_NAME);

        await migrateDatabase(database);
        return database;
      })
      .catch(() => {
        return null;
      });
  }

  return databasePromise;
}

export function getDatabaseSync() {
  if (syncDatabase !== undefined) {
    return syncDatabase;
  }

  const nativeModule = requireOptionalNativeModule("ExpoSQLite");

  if (!nativeModule) {
    syncDatabase = null;
    return syncDatabase;
  }

  try {
    const SQLiteModule = require("expo-sqlite") as typeof SQLite;
    const database = SQLiteModule.openDatabaseSync(DATABASE_NAME);

    migrateDatabaseSync(database);
    syncDatabase = database;
    return syncDatabase;
  } catch {
    syncDatabase = null;
    return syncDatabase;
  }
}
