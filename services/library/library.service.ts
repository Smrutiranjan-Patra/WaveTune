import type { MusicAsset } from "../../types/music";

import {
  getPersistedSongs,
  replacePersistedSongs,
} from "../database/songs.repository";
import { requestLibraryPermission } from "./permission.service";
import { scanSongs } from "./scanner.service";

import { getAlbums } from "../../helpers/library/albums";
import { getArtists } from "../../helpers/library/artists";
import { getGenres } from "../../helpers/library/genres";
import { getFolders } from "../../helpers/library/folders";

export function buildLibrary(songs: MusicAsset[]) {
  return {
    songs,
    albums: getAlbums(songs),
    artists: getArtists(songs),
    genres: getGenres(songs),
    folders: getFolders(songs),
  };
}

export async function initializeLibrary() {
  const cachedSongs = await getPersistedSongs();

  try {
    const granted = await requestLibraryPermission();

    if (!granted) {
      if (cachedSongs.length > 0) {
        return buildLibrary(cachedSongs);
      }

      throw new Error("Permission denied");
    }

    const songs = await scanSongs(cachedSongs);

    await replacePersistedSongs(songs);

    const persistedSongs = await getPersistedSongs();

    if (persistedSongs.length > 0 || songs.length === 0) {
      return buildLibrary(persistedSongs);
    }

    return buildLibrary(songs);
  } catch (error) {
    if (cachedSongs.length > 0) {
      return buildLibrary(cachedSongs);
    }

    throw error;
  }
}
