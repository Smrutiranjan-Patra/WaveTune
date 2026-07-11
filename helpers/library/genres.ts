import * as MediaLibrary from "expo-media-library";
import type { LibraryGenre } from "../../store/library.store";

const getGenres = (songs: MediaLibrary.Asset[]): LibraryGenre[] => [
  {
    name: "Unknown Genre",
    songs,
  },
];

export { getGenres };
