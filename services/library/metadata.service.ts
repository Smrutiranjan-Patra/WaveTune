import { NativeModules, Platform } from "react-native";
import type * as MediaLibrary from "expo-media-library";

import type { MusicAsset } from "../../types/music";

type NativeMetadata = {
  albumId?: string;
  albumTitle?: string;
  artist?: string;
  genre?: string;
  id: string;
  title?: string;
};

type MusicMetadataNativeModule = {
  getAudioMetadata(assetIds: string[]): Promise<NativeMetadata[]>;
};

const nativeMetadataModule = NativeModules.WaveTuneMusicMetadata as
  | MusicMetadataNativeModule
  | undefined;

export async function enrichSongMetadata(
  songs: MediaLibrary.Asset[],
): Promise<MusicAsset[]> {
  if (
    Platform.OS !== "android" ||
    !nativeMetadataModule ||
    songs.length === 0
  ) {
    return songs;
  }

  try {
    const metadata = await nativeMetadataModule.getAudioMetadata(
      songs.map((song) => song.id),
    );
    const metadataById = new Map(metadata.map((item) => [item.id, item]));

    return songs.map((song) => {
      const item = metadataById.get(song.id);

      if (!item) {
        return song;
      }

      return {
        ...song,
        albumId: item.albumId ?? song.albumId,
        albumTitle: item.albumTitle,
        artist: item.artist,
        genre: item.genre,
        title: item.title,
      };
    });
  } catch {
    return songs;
  }
}
