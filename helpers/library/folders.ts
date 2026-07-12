import type { LibraryFolder } from "../../store/library.store";
import type { MusicAsset } from "../../types/music";

const getFolders = (songs: MusicAsset[]): LibraryFolder[] => {
  const folders = new Map<string, LibraryFolder>();

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
