import { requestLibraryPermission } from "./permission.service";
import { scanSongs } from "./scanner.service";

import { getAlbums } from "../../helpers/library/albums";
import { getArtists } from "../../helpers/library/artists";
import { getGenres } from "../../helpers/library/genres";
import { getFolders } from "../../helpers/library/folders";

export async function initializeLibrary() {
  const granted = await requestLibraryPermission();

  if (!granted) {
    throw new Error("Permission denied");
  }

  const songs = await scanSongs();

  return {
    songs,
    albums: getAlbums(songs),
    artists: getArtists(songs),
    genres: getGenres(songs),
    folders: getFolders(songs),
  };
}
