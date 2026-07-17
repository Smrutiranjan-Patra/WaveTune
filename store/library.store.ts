// src/store/library.store.ts

import { create } from "zustand";

import { loadLibraryData } from "./handlers/library.handlers";
import { usePlayerStore } from "./player.store";
import { buildLibrary } from "../services/library/library.service";
import {
  type EditableSongMetadata,
  saveSongMetadata,
  type SaveSongMetadataResult,
} from "../services/library/metadata-editor.service";
import type { MusicAsset } from "../types/music";

export type LibraryAlbum = {
  id: string;
  name: string;
  songs: MusicAsset[];
};

export type LibraryArtist = {
  name: string;
  songs: MusicAsset[];
};

export type LibraryGenre = {
  name: string;
  songs: MusicAsset[];
};

export type LibraryFolder = {
  name: string;
  path: string;
  songs: MusicAsset[];
};

interface LibraryState {
  loading: boolean;
  initialized: boolean;
  error: string | null;
  lastScanCount: number;

  songs: MusicAsset[];
  albums: LibraryAlbum[];
  folders: LibraryFolder[];
  artists: LibraryArtist[];
  genres: LibraryGenre[];

  loadLibraryData: () => Promise<void>;
  updateSongMetadata: (
    songId: string,
    metadata: EditableSongMetadata,
  ) => Promise<SaveSongMetadataResult>;
  resetLibraryState: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  loading: true,
  initialized: false,
  error: null,
  lastScanCount: 0,

  songs: [],
  albums: [],
  folders: [],
  artists: [],
  genres: [],

  loadLibraryData: () => loadLibraryData(set, get),
  updateSongMetadata: async (songId, metadata) => {
    const result = await saveSongMetadata(songId, metadata);
    const songs = get().songs.map((song) =>
      song.id === songId
        ? {
            ...song,
            albumTitle: result.metadata.albumTitle ?? undefined,
            artist: result.metadata.artist ?? undefined,
            genre: result.metadata.genre ?? undefined,
            title: result.metadata.title ?? undefined,
          }
        : song,
    );

    set({
      ...buildLibrary(songs),
      lastScanCount: songs.length,
    });

    usePlayerStore.getState().updateTrackMetadata(songId, result.metadata);

    return result;
  },
  resetLibraryState: () => {
    set({
      albums: [],
      artists: [],
      error: null,
      folders: [],
      genres: [],
      initialized: false,
      lastScanCount: 0,
      loading: false,
      songs: [],
    });
  },
}));
