import { requireOptionalNativeModule } from "expo-modules-core";
import { Platform } from "react-native";
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

const nativeMetadataModule = requireOptionalNativeModule("WaveTuneAudioRoute") as
  | MusicMetadataNativeModule
  | null;

export async function enrichSongMetadata(
  songs: MediaLibrary.Asset[],
): Promise<MusicAsset[]> {
  if (
    Platform.OS !== "android" ||
    !nativeMetadataModule?.getAudioMetadata ||
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

      const existingSong = song as MusicAsset;

      return {
        ...song,
        albumId: item.albumId ?? song.albumId,
        albumTitle: item.albumTitle ?? existingSong.albumTitle,
        artist: item.artist ?? existingSong.artist,
        genre: item.genre ?? existingSong.genre,
        title: item.title ?? existingSong.title,
      };
    });
  } catch {
    return songs;
  }
}
