import * as MediaLibrary from "expo-media-library";
import { getFolders, getAlbums, getArtists, getGenres } from "../../utils/helper"

const loadLibrary = async (set, get) => {
  set({ loading: true });

  const permission = await MediaLibrary.requestPermissionsAsync();

  if (!permission.granted) {
    set({
      loading: false,
      initialized: true,
    });

    return;
  }

  const result = await MediaLibrary.getAssetsAsync({
    mediaType: "audio",
    first: 5000,
  });

  const songs = result.assets;
  const folders = getFolders(songs);
  const albums = getAlbums(songs);
  const artists = getArtists(songs);
  const genres = getGenres(songs);

  set({
    songs,
    folders,
    albums,
    artists,
    genres,
    loading: false,
    initialized: true,
  });
};

export {
  loadLibrary
};
