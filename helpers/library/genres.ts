import type { LibraryGenre } from "../../store/library.store";
import type { MusicAsset } from "../../types/music";
import { UNKNOWN_GENRE } from "../../types/music";

const getGenres = (songs: MusicAsset[]): LibraryGenre[] => {
  const genres = new Map<string, MusicAsset[]>();

  songs.forEach((song) => {
    const names = song.genre
      ? song.genre
          .split(/[;,]/)
          .map((name) => name.trim())
          .filter(Boolean)
      : [UNKNOWN_GENRE];

    names.forEach((name) => {
      const genreSongs = genres.get(name) ?? [];
      genreSongs.push(song);
      genres.set(name, genreSongs);
    });
  });

  return [...genres.entries()]
    .map(([name, genreSongs]) => ({ name, songs: genreSongs }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export { getGenres };
