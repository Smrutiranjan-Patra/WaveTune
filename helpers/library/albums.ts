import type { LibraryAlbum } from "../../store/library.store";
import type { MusicAsset } from "../../types/music";
import { UNKNOWN_ALBUM } from "../../types/music";

const getAlbums = (songs: MusicAsset[]): LibraryAlbum[] => {
  const albums = new Map<string, LibraryAlbum>();

  songs.forEach((song) => {
    const name = song.albumTitle?.trim() || UNKNOWN_ALBUM;
    const id = song.albumId ?? name.toLocaleLowerCase();

    if (!albums.has(id)) {
      albums.set(id, {
        id,
        name,
        songs: [],
      });
    }

    albums.get(id).songs.push(song);
  });

  return [...albums.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export { getAlbums };
