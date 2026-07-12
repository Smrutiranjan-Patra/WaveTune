import { getDatabase } from "./database.service";

export type PlaybackHistoryEntry = {
  lastPlayedAt: number;
  playCount: number;
  songId: string;
};

export type PlaylistRecord = {
  createdAt: number;
  id: string;
  name: string;
  songIds: string[];
  updatedAt: number;
};

type HistoryRow = { last_played_at: number; play_count: number; song_id: string };
type PlaylistRow = { created_at: number; id: string; name: string; updated_at: number };
type PlaylistSongRow = { playlist_id: string; song_id: string };

export async function getFavoriteSongIds() {
  const database = await getDatabase();
  if (!database) return [];
  const rows = await database.getAllAsync<{ song_id: string }>(
    "SELECT song_id FROM favorite_songs ORDER BY created_at DESC",
  );
  return rows.map((row) => row.song_id);
}

export async function setFavoriteSong(songId: string, favorite: boolean) {
  const database = await getDatabase();
  if (!database) return;
  if (favorite) {
    await database.runAsync(
      "INSERT OR REPLACE INTO favorite_songs (song_id, created_at) VALUES (?, ?)",
      [songId, Date.now()],
    );
  } else {
    await database.runAsync("DELETE FROM favorite_songs WHERE song_id = ?", songId);
  }
}

export async function getPlaybackHistory() {
  const database = await getDatabase();
  if (!database) return [];
  const rows = await database.getAllAsync<HistoryRow>(
    `SELECT song_id, play_count, last_played_at
     FROM playback_history ORDER BY last_played_at DESC`,
  );
  return rows.map((row) => ({
    lastPlayedAt: row.last_played_at,
    playCount: row.play_count,
    songId: row.song_id,
  }));
}

export async function recordSongPlayed(songId: string) {
  const database = await getDatabase();
  if (!database) return;
  await database.runAsync(
    `INSERT INTO playback_history (song_id, play_count, last_played_at)
     VALUES (?, 1, ?)
     ON CONFLICT(song_id) DO UPDATE SET
       play_count = play_count + 1,
       last_played_at = excluded.last_played_at`,
    [songId, Date.now()],
  );
}

export async function getPlaylists() {
  const database = await getDatabase();
  if (!database) return [];
  const [playlistRows, songRows] = await Promise.all([
    database.getAllAsync<PlaylistRow>(
      "SELECT id, name, created_at, updated_at FROM playlists ORDER BY updated_at DESC",
    ),
    database.getAllAsync<PlaylistSongRow>(
      "SELECT playlist_id, song_id FROM playlist_songs ORDER BY playlist_id, position",
    ),
  ]);
  return playlistRows.map((row) => ({
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    songIds: songRows.filter((song) => song.playlist_id === row.id).map((song) => song.song_id),
    updatedAt: row.updated_at,
  }));
}

export async function savePlaylist(playlist: PlaylistRecord) {
  const database = await getDatabase();
  if (!database) return;
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      `INSERT OR REPLACE INTO playlists (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [playlist.id, playlist.name, playlist.createdAt, playlist.updatedAt],
    );
    await database.runAsync("DELETE FROM playlist_songs WHERE playlist_id = ?", playlist.id);
    for (const [position, songId] of playlist.songIds.entries()) {
      await database.runAsync(
        `INSERT INTO playlist_songs (playlist_id, song_id, position, added_at) VALUES (?, ?, ?, ?)`,
        [playlist.id, songId, position, Date.now()],
      );
    }
  });
}

export async function deletePersistedPlaylist(playlistId: string) {
  const database = await getDatabase();
  if (!database) return;
  await database.withTransactionAsync(async () => {
    await database.runAsync("DELETE FROM playlist_songs WHERE playlist_id = ?", playlistId);
    await database.runAsync("DELETE FROM playlists WHERE id = ?", playlistId);
  });
}
