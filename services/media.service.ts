import * as MediaLibrary from "expo-media-library";

export async function getSongs() {
  // Check existing permission
  let permission = await MediaLibrary.getPermissionsAsync();

  // Ask for permission if needed
  if (!permission.granted) {
    permission = await MediaLibrary.requestPermissionsAsync();
  }

  if (!permission.granted) {
    throw new Error("Media library permission denied");
  }

  const { assets } = await MediaLibrary.getAssetsAsync({
    mediaType: "audio",
    first: 1000,
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
  });

  return assets;
}
