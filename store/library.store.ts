// src/store/library.store.ts

import { create } from "zustand";
import * as MediaLibrary from "expo-media-library";

import { loadLibrary } from "./handlers/library.handlers";

interface LibraryState {
  loading: boolean;
  initialized: boolean;

  songs: MediaLibrary.Asset[];
  albums: MediaLibrary.Asset[];
  folders: MediaLibrary.Asset[];
  artists: MediaLibrary.Asset[];
  genres: MediaLibrary.Asset[];

  loadLibrary: (...args: any[]) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  loading: true,
  initialized: false,

  songs: [],
  albums: [],
  folders: [],
  artists: [],
  genres: [],

  loadLibrary: (...args) => loadLibrary(set, get, ...args),
}));
