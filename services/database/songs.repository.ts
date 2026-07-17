import * as MediaLibrary from "expo-media-library";

import { getDatabase } from "./database.service";
import type { MusicAsset } from "../../types/music";

export type SongMetadataUpdate = {
  albumTitle: string | null;
  artist: string | null;
  genre: string | null;
  title: string | null;
};

type SongRow = {
  album_id: string | null;
  album_title: string | null;
  artist: string | null;
  creation_time: number;
  duration: number;
  file_size: number;
  filename: string;
  height: number;
  id: string;
  genre: string | null;
  media_subtypes: string;
  media_type: MediaLibrary.MediaTypeValue;
  modification_time: number;
  title: string | null;
  uri: string;
  width: number;
};

type SongMetadataOverrideRow = {
  album_title: string | null;
  artist: string | null;
  genre: string | null;
  song_id: string;
  title: string | null;
};

function parseMediaSubtypes(value: string) {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToAsset(row: SongRow): MusicAsset {
  return {
    albumId: row.album_id ?? undefined,
    albumTitle: row.album_title ?? undefined,
    artist: row.artist ?? undefined,
    creationTime: row.creation_time,
    duration: row.duration,
    fileSize: row.file_size,
    filename: row.filename,
    height: row.height,
    id: row.id,
    genre: row.genre ?? undefined,
    mediaSubtypes: parseMediaSubtypes(row.media_subtypes),
    mediaType: row.media_type,
    modificationTime: row.modification_time,
    title: row.title ?? undefined,
    uri: row.uri,
    width: row.width,
  };
}

function applyMetadataUpdate(
  song: MusicAsset,
  metadata: SongMetadataUpdate,
): MusicAsset {
  return {
    ...song,
    albumTitle: metadata.albumTitle ?? undefined,
    artist: metadata.artist ?? undefined,
    genre: metadata.genre ?? undefined,
    title: metadata.title ?? undefined,
  };
}

function rowToMetadataUpdate(
  row: SongMetadataOverrideRow,
): SongMetadataUpdate {
  return {
    albumTitle: row.album_title,
    artist: row.artist,
    genre: row.genre,
    title: row.title,
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
      file_size,
      album_id,
      title,
      artist,
      album_title,
      genre
    FROM songs
    ORDER BY LOWER(filename) ASC
  `);

  return rows.map(rowToAsset);
}

export async function replacePersistedSongs(songs: MusicAsset[]) {
  const database = await getDatabase();

  if (!database) {
    return;
  }

  const updatedAt = Date.now();
  const overrides = new Map(
    (
      await database.getAllAsync<SongMetadataOverrideRow>(`
        SELECT song_id, title, artist, album_title, genre
        FROM song_metadata_overrides
      `)
    ).map((row) => [row.song_id, rowToMetadataUpdate(row)]),
  );

  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM songs");

    for (const song of songs) {
      const persistedSong = overrides.has(song.id)
        ? applyMetadataUpdate(song, overrides.get(song.id)!)
        : song;

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
            file_size,
            album_id,
            title,
            artist,
            album_title,
            genre,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          persistedSong.id,
          persistedSong.filename,
          persistedSong.uri,
          persistedSong.mediaType,
          JSON.stringify(persistedSong.mediaSubtypes ?? []),
          persistedSong.width ?? 0,
          persistedSong.height ?? 0,
          persistedSong.creationTime ?? 0,
          persistedSong.modificationTime ?? 0,
          persistedSong.duration ?? 0,
          persistedSong.fileSize ?? 0,
          persistedSong.albumId ?? null,
          persistedSong.title ?? null,
          persistedSong.artist ?? null,
          persistedSong.albumTitle ?? null,
          persistedSong.genre ?? null,
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

export async function updatePersistedSongMetadata(
  songId: string,
  metadata: SongMetadataUpdate,
) {
  const database = await getDatabase();

  if (!database) {
    return;
  }

  const updatedAt = Date.now();

  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `
        UPDATE songs
        SET
          title = ?,
          artist = ?,
          album_title = ?,
          genre = ?,
          updated_at = ?
        WHERE id = ?
      `,
      [
        metadata.title,
        metadata.artist,
        metadata.albumTitle,
        metadata.genre,
        updatedAt,
        songId,
      ],
    );

    await database.runAsync(
      `
        INSERT OR REPLACE INTO song_metadata_overrides (
          song_id,
          title,
          artist,
          album_title,
          genre,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        songId,
        metadata.title,
        metadata.artist,
        metadata.albumTitle,
        metadata.genre,
        updatedAt,
      ],
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
    await database.runAsync("DELETE FROM song_metadata_overrides");
    await database.runAsync(
      "DELETE FROM app_metadata WHERE key = 'last_library_scan_at'",
    );
  });
}
