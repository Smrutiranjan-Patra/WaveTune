import { getInfoAsync } from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useSettingsStore } from "../../store/settings.store";
import type { MusicAsset } from "../../types/music";
import { enrichSongMetadata } from "./metadata.service";

const normalizeFolderPath = (folderPath: string) => {
  const trimmedPath = folderPath.trim();

  if (!trimmedPath) {
    return "/";
  }

  const withoutProtocol = trimmedPath.replace("file://", "");
  const withoutTrailingSlash = withoutProtocol.endsWith("/")
    ? withoutProtocol.slice(0, -1)
    : withoutProtocol;

  return withoutTrailingSlash.startsWith("/")
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`;
};

const getAssetFolderPath = (asset: MediaLibrary.Asset) => {
  const uri = asset.uri ?? "";
  const folderPath = uri.replace("file://", "");
  const normalizedPath = normalizeFolderPath(folderPath);
  const lastSlashIndex = normalizedPath.lastIndexOf("/");

  if (lastSlashIndex <= 0) {
    return normalizedPath;
  }

  return normalizedPath.substring(0, lastSlashIndex);
};

const FILE_SIZE_BATCH_SIZE = 40;

async function getFileSize(song: MusicAsset) {
  try {
    const info = await getInfoAsync(song.uri);

    return info.exists && !info.isDirectory ? info.size : 0;
  } catch {
    return 0;
  }
}

async function addFileSizes(songs: MusicAsset[]) {
  const songsWithSizes: MusicAsset[] = [];

  for (let index = 0; index < songs.length; index += FILE_SIZE_BATCH_SIZE) {
    const batch = songs.slice(index, index + FILE_SIZE_BATCH_SIZE);
    const resolvedBatch = await Promise.all(
      batch.map(async (song) => ({
        ...song,
        fileSize: await getFileSize(song),
      })),
    );

    songsWithSizes.push(...resolvedBatch);
  }

  return songsWithSizes;
}

export async function scanSongs() {
  const excludedFolderPaths = useSettingsStore.getState().excludedFolderPaths;
  let songs: MediaLibrary.Asset[] = [];
  let after: string | undefined = undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: 1000,
      after,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    songs.push(...result.assets);

    hasNextPage = result.hasNextPage;
    after = result.endCursor;
  }

  const includedSongs = songs.filter((song) => {
    const folderPath = getAssetFolderPath(song);

    return !excludedFolderPaths.some((excludedFolder) => {
      const normalizedExcludedFolder = normalizeFolderPath(excludedFolder);

      return (
        folderPath === normalizedExcludedFolder ||
        folderPath.startsWith(`${normalizedExcludedFolder}/`)
      );
    });
  });

  return addFileSizes(await enrichSongMetadata(includedSongs));
}

export async function getAvailableMusicFolders() {
  const folders = new Map<string, { name: string; path: string }>();
  let after: string | undefined = undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: "audio",
      first: 1000,
      after,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    result.assets.forEach((asset) => {
      const folderPath = getAssetFolderPath(asset);
      const folderName =
        folderPath.substring(folderPath.lastIndexOf("/") + 1) || folderPath;

      if (!folders.has(folderPath)) {
        folders.set(folderPath, {
          name: folderName,
          path: folderPath,
        });
      }
    });

    hasNextPage = result.hasNextPage;
    after = result.endCursor;
  }

  return [...folders.values()].sort((a, b) => a.name.localeCompare(b.name));
}
