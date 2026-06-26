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

const getAlbums = (songs) => {
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

const getArtists = (songs) => [
  {
    name: "Unknown Artist",
    songs,
  },
];

const getGenres = (songs) => [
  {
    name: "Unknown Genre",
    songs,
  },
];

export { getFolders, getAlbums, getArtists, getGenres };
