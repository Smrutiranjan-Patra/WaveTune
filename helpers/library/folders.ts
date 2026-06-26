const getFolders = (songs) => {
  const folders = new Map();

  songs.forEach((song) => {
    const path = song.uri.replace("file://", "");
    const folder = path.substring(0, path.lastIndexOf("/"));

    if (!folders.has(folder)) {
      folders.set(folder, {
        path: folder,
        songs: [],
      });
    }

    folders.get(folder).songs.push(song);
  });

  return [...folders.values()];
};

export { getFolders };
