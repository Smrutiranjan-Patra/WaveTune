import * as MediaLibrary from "expo-media-library";
import type { LibraryAlbum } from "../../store/library.store";

const getAlbums = (songs: MediaLibrary.Asset[]): LibraryAlbum[] => {
  const albums = new Map();

  songs.forEach((song) => {
    const id = song.albumId ?? "unknown";

    if (!albums.has(id)) {
      albums.set(id, {
        id,
        songs: [],
      });
    }

    albums.get(id).songs.push(song);
  });

  return [...albums.values()];
};

export { getAlbums };
