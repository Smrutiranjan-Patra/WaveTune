// src/store/library.store.ts

import { create } from "zustand";
import * as MediaLibrary from "expo-media-library";

import { loadLibraryData } from "./handlers/library.handlers";

export type LibraryAlbum = {
  id: string;
  songs: MediaLibrary.Asset[];
};

export type LibraryArtist = {
  name: string;
  songs: MediaLibrary.Asset[];
};

export type LibraryGenre = {
  name: string;
  songs: MediaLibrary.Asset[];
};

export type LibraryFolder = {
  name: string;
  path: string;
  songs: MediaLibrary.Asset[];
};

interface LibraryState {
  loading: boolean;
  initialized: boolean;
  error: string | null;
  lastScanCount: number;

  songs: MediaLibrary.Asset[];
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
