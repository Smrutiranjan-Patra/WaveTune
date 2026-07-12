import type { LibraryArtist } from "../../store/library.store";
import type { MusicAsset } from "../../types/music";
import { UNKNOWN_ARTIST } from "../../types/music";

const getArtists = (songs: MusicAsset[]): LibraryArtist[] => {
  const artists = new Map<string, MusicAsset[]>();

  songs.forEach((song) => {
    const name = song.artist?.trim() || UNKNOWN_ARTIST;
    const artistSongs = artists.get(name) ?? [];
    artistSongs.push(song);
    artists.set(name, artistSongs);
  });

  return [...artists.entries()]
    .map(([name, artistSongs]) => ({ name, songs: artistSongs }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export { getArtists };
