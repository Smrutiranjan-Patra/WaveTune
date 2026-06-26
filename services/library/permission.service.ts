import * as MediaLibrary from "expo-media-library";

export async function requestLibraryPermission() {
  const permission = await MediaLibrary.requestPermissionsAsync();

  return permission.granted;
}
