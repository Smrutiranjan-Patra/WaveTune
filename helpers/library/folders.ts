import * as MediaLibrary from "expo-media-library";
import type { LibraryFolder } from "../../store/library.store";

const getFolders = (songs: MediaLibrary.Asset[]): LibraryFolder[] => {
  const folders = new Map();

  songs.forEach((song) => {
    const path = song.uri.replace("file://", "");
    const folder = path.substring(0, path.lastIndexOf("/"));
    const name = folder.substring(folder.lastIndexOf("/") + 1) || folder;

    if (!folders.has(folder)) {
      folders.set(folder, {
        name,
        path: folder,
        songs: [],
      });
    }

    folders.get(folder).songs.push(song);
  });

  return [...folders.values()];
};

export { getFolders };
