// src/store/library.store.ts

import { create } from "zustand";

import { loadLibraryData } from "./handlers/library.handlers";
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
}));
