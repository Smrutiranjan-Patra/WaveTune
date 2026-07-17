import {
  type SongMetadataUpdate,
  updatePersistedSongMetadata,
} from "../database/songs.repository";
import { updateDeviceSongMetadata } from "./metadata.service";

export type EditableSongMetadata = {
  albumTitle: string;
  artist: string;
  genre: string;
  title: string;
};

export type SaveSongMetadataResult = {
  deviceUpdated: boolean;
  metadata: SongMetadataUpdate;
};

function normalizeMetadataValue(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function normalizeEditableSongMetadata(
  metadata: EditableSongMetadata,
): SongMetadataUpdate {
  return {
    albumTitle: normalizeMetadataValue(metadata.albumTitle),
    artist: normalizeMetadataValue(metadata.artist),
    genre: normalizeMetadataValue(metadata.genre),
    title: normalizeMetadataValue(metadata.title),
  };
}

export async function saveSongMetadata(
  songId: string,
  metadata: EditableSongMetadata,
): Promise<SaveSongMetadataResult> {
  const normalizedMetadata = normalizeEditableSongMetadata(metadata);
  const deviceUpdated = await updateDeviceSongMetadata(
    songId,
    normalizedMetadata,
  );

  await updatePersistedSongMetadata(songId, normalizedMetadata);

  return {
    deviceUpdated,
    metadata: normalizedMetadata,
  };
}
