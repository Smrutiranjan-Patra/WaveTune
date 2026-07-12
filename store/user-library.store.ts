import { create } from "zustand";

import {
  deletePersistedPlaylist,
  getFavoriteSongIds,
  getPlaybackHistory,
  getPlaylists,
  PlaybackHistoryEntry,
  PlaylistRecord,
  recordSongPlayed,
  savePlaylist,
  setFavoriteSong,
} from "../services/database/user-library.repository";

interface UserLibraryState {
  favoriteSongIds: string[];
  history: PlaybackHistoryEntry[];
  hydrated: boolean;
  playlists: PlaylistRecord[];
  hydrateUserLibrary: () => Promise<void>;
  toggleFavorite: (songId: string) => void;
  recordPlay: (songId: string) => void;
  createPlaylist: (name: string, songIds?: string[]) => string;
  deletePlaylist: (playlistId: string) => void;
  updatePlaylist: (
    playlistId: string,
    updates: { name?: string; songIds?: string[] },
  ) => void;
  setPlaylistSongs: (playlistId: string, songIds: string[]) => void;
}

export const useUserLibraryStore = create<UserLibraryState>((set, get) => ({
  favoriteSongIds: [],
  history: [],
  hydrated: false,
  playlists: [],

  hydrateUserLibrary: async () => {
    const [favoriteSongIds, history, playlists] = await Promise.all([
      getFavoriteSongIds(),
      getPlaybackHistory(),
      getPlaylists(),
    ]);
    set({ favoriteSongIds, history, hydrated: true, playlists });
  },
  toggleFavorite: (songId) => {
    const isFavorite = get().favoriteSongIds.includes(songId);
    const favoriteSongIds = isFavorite
      ? get().favoriteSongIds.filter((id) => id !== songId)
      : [songId, ...get().favoriteSongIds];
    set({ favoriteSongIds });
    void setFavoriteSong(songId, !isFavorite);
  },
  recordPlay: (songId) => {
    const now = Date.now();
    const previous = get().history.find((entry) => entry.songId === songId);
    const history = [
      { lastPlayedAt: now, playCount: (previous?.playCount ?? 0) + 1, songId },
      ...get().history.filter((entry) => entry.songId !== songId),
    ];
    set({ history });
    void recordSongPlayed(songId);
  },
  createPlaylist: (name, songIds = []) => {
    const now = Date.now();
    const playlist: PlaylistRecord = {
      createdAt: now,
      id: `playlist-${now}`,
      name: name.trim() || "New Playlist",
      songIds: [...new Set(songIds)],
      updatedAt: now,
    };
    set({ playlists: [playlist, ...get().playlists] });
    void savePlaylist(playlist);
    return playlist.id;
  },
  deletePlaylist: (playlistId) => {
    set({ playlists: get().playlists.filter((playlist) => playlist.id !== playlistId) });
    void deletePersistedPlaylist(playlistId);
  },
  updatePlaylist: (playlistId, updates) => {
    const playlists = get().playlists.map((playlist) => {
      if (playlist.id !== playlistId) {
        return playlist;
      }

      return {
        ...playlist,
        name:
          updates.name !== undefined
            ? updates.name.trim() || "New Playlist"
            : playlist.name,
        songIds:
          updates.songIds !== undefined
            ? [...new Set(updates.songIds)]
            : playlist.songIds,
        updatedAt: Date.now(),
      };
    });
    set({ playlists });
    const playlist = playlists.find((item) => item.id === playlistId);
    if (playlist) void savePlaylist(playlist);
  },
  setPlaylistSongs: (playlistId, songIds) => {
    const playlists = get().playlists.map((playlist) =>
      playlist.id === playlistId
        ? { ...playlist, songIds: [...new Set(songIds)], updatedAt: Date.now() }
        : playlist,
    );
    set({ playlists });
    const playlist = playlists.find((item) => item.id === playlistId);
    if (playlist) void savePlaylist(playlist);
  },
}));
