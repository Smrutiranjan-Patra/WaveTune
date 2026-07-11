import * as MediaLibrary from "expo-media-library";
import type { LibraryArtist } from "../../store/library.store";

const getArtists = (songs: MediaLibrary.Asset[]): LibraryArtist[] => [
  {
    name: "Unknown Artist",
    songs,
  },
];

export { getArtists };
