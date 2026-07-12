import * as MediaLibrary from "expo-media-library";

export async function requestLibraryPermission() {
  const isAvailable = await MediaLibrary.isAvailableAsync();

  if (!isAvailable) {
    throw new Error("Media library is not available on this device.");
  }

  let permission = await MediaLibrary.getPermissionsAsync(false, ["audio"]);

  if (!permission.granted) {
    permission = await MediaLibrary.requestPermissionsAsync(false, ["audio"]);
  }

  return permission.granted;
}
