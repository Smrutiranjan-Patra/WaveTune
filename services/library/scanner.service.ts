import * as MediaLibrary from "expo-media-library";

export async function scanSongs() {
  let songs = [];
  let after: string | undefined = undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: 1000,
      after,
    });

    songs.push(...result.assets);

    hasNextPage = result.hasNextPage;
    after = result.endCursor;
  }

  return songs;
}
