// src/store/library.store.ts

import { create } from "zustand";
import * as MediaLibrary from "expo-media-library";

import { loadLibraryData } from "./handlers/library.handlers";

interface LibraryState {
  loading: boolean;
  initialized: boolean;

  songs: MediaLibrary.Asset[];
  albums: MediaLibrary.Asset[];
  folders: MediaLibrary.Asset[];
  artists: MediaLibrary.Asset[];
  genres: MediaLibrary.Asset[];

  loadLibraryData: (...args: any[]) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  loading: true,
  initialized: false,

  songs: [],
  albums: [],
  folders: [],
  artists: [],
  genres: [],

  loadLibraryData: (...args) => loadLibraryData(set, get, ...args),
}));
