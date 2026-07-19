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

function isUnchangedSong(song: MusicAsset, cachedSong?: MusicAsset) {
  return Boolean(
    cachedSong &&
      cachedSong.uri === song.uri &&
      cachedSong.modificationTime === song.modificationTime,
  );
}

function applyCachedMetadata(song: MusicAsset, cachedSong: MusicAsset): MusicAsset {
  return {
    ...song,
    albumId: cachedSong.albumId ?? song.albumId,
    albumTitle: cachedSong.albumTitle,
    artist: cachedSong.artist,
    genre: cachedSong.genre,
    title: cachedSong.title,
  };
}

async function getFileSize(song: MusicAsset) {
  try {
    const info = await getInfoAsync(song.uri);

    return info.exists && !info.isDirectory ? info.size : 0;
  } catch {
    return 0;
  }
}

async function addFileSizes(
  songs: MusicAsset[],
  cachedSongsById: Map<string, MusicAsset>,
) {
  const songsMissingSizes = songs.filter((song) => {
    const cachedSong = cachedSongsById.get(song.id);

    return !isUnchangedSong(song, cachedSong) || cachedSong.fileSize === undefined;
  });
  const fileSizesById = new Map<string, number>();

  for (
    let index = 0;
    index < songsMissingSizes.length;
    index += FILE_SIZE_BATCH_SIZE
  ) {
    const batch = songsMissingSizes.slice(index, index + FILE_SIZE_BATCH_SIZE);
    const resolvedBatch = await Promise.all(
      batch.map(async (song) => [song.id, await getFileSize(song)] as const),
    );

    resolvedBatch.forEach(([id, fileSize]) => fileSizesById.set(id, fileSize));
  }

  return songs.map((song) => {
    const cachedSong = cachedSongsById.get(song.id);

    return {
      ...song,
      fileSize: isUnchangedSong(song, cachedSong)
        ? cachedSong.fileSize
        : (fileSizesById.get(song.id) ?? 0),
    };
  });
}

export async function scanSongs(cachedSongs: MusicAsset[] = []) {
  const excludedFolderPaths = useSettingsStore.getState().excludedFolderPaths;
  const cachedSongsById = new Map(
    cachedSongs.map((song) => [song.id, song]),
  );
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

  const songsMissingMetadata = includedSongs.filter(
    (song) => !isUnchangedSong(song, cachedSongsById.get(song.id)),
  );
  const enrichedMetadataById = new Map(
    (await enrichSongMetadata(songsMissingMetadata)).map((song) => [
      song.id,
      song,
    ]),
  );
  const songsWithMetadata = includedSongs.map((song) => {
    const cachedSong = cachedSongsById.get(song.id);

    if (cachedSong && isUnchangedSong(song, cachedSong)) {
      return applyCachedMetadata(song, cachedSong);
    }

    return enrichedMetadataById.get(song.id) ?? song;
  });

  return addFileSizes(songsWithMetadata, cachedSongsById);
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
