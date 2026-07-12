import * as MediaLibrary from "expo-media-library";

import { getDatabase } from "./database.service";

type SongRow = {
  album_id: string | null;
  creation_time: number;
  duration: number;
  filename: string;
  height: number;
  id: string;
  media_subtypes: string;
  media_type: MediaLibrary.MediaTypeValue;
  modification_time: number;
  uri: string;
  width: number;
};

function parseMediaSubtypes(value: string) {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToAsset(row: SongRow): MediaLibrary.Asset {
  return {
    albumId: row.album_id ?? undefined,
    creationTime: row.creation_time,
    duration: row.duration,
    filename: row.filename,
    height: row.height,
    id: row.id,
    mediaSubtypes: parseMediaSubtypes(row.media_subtypes),
    mediaType: row.media_type,
    modificationTime: row.modification_time,
    uri: row.uri,
    width: row.width,
  };
}

export async function getPersistedSongs() {
  const database = await getDatabase();

  if (!database) {
    return [];
  }

  const rows = await database.getAllAsync<SongRow>(`
    SELECT
      id,
      filename,
      uri,
      media_type,
      media_subtypes,
      width,
      height,
      creation_time,
      modification_time,
      duration,
      album_id
    FROM songs
    ORDER BY LOWER(filename) ASC
  `);

  return rows.map(rowToAsset);
}

export async function replacePersistedSongs(songs: MediaLibrary.Asset[]) {
  const database = await getDatabase();

  if (!database) {
    return;
  }

  const updatedAt = Date.now();

  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM songs");

    for (const song of songs) {
      await database.runAsync(
        `
          INSERT OR REPLACE INTO songs (
            id,
            filename,
            uri,
            media_type,
            media_subtypes,
            width,
            height,
            creation_time,
            modification_time,
            duration,
            album_id,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          song.id,
          song.filename,
          song.uri,
          song.mediaType,
          JSON.stringify(song.mediaSubtypes ?? []),
          song.width ?? 0,
          song.height ?? 0,
          song.creationTime ?? 0,
          song.modificationTime ?? 0,
          song.duration ?? 0,
          song.albumId ?? null,
          updatedAt,
        ],
      );
    }

    await database.runAsync(
      `
        INSERT OR REPLACE INTO app_metadata (key, value)
        VALUES ('last_library_scan_at', ?)
      `,
      String(updatedAt),
    );
  });
}

export async function clearPersistedSongs() {
  const database = await getDatabase();

  if (!database) {
    return;
  }

  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM songs");
    await database.runAsync(
      "DELETE FROM app_metadata WHERE key = 'last_library_scan_at'",
    );
  });
}
