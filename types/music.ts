import type * as MediaLibrary from "expo-media-library";

export type MusicAsset = MediaLibrary.Asset & {
  albumTitle?: string;
  artist?: string;
  fileSize?: number;
  genre?: string;
  title?: string;
};

export const UNKNOWN_ALBUM = "Unknown Album";
export const UNKNOWN_ARTIST = "Unknown Artist";
export const UNKNOWN_GENRE = "Unknown Genre";
