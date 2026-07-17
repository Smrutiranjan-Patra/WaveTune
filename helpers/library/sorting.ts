import type { MusicAsset } from "../../types/music";

export type LibrarySortOption =
  | "title"
  | "artist"
  | "album"
  | "duration"
  | "size"
  | "dateAdded";

export const librarySortOptions: {
  label: string;
  value: LibrarySortOption;
}[] = [
  { label: "Title", value: "title" },
  { label: "Artist", value: "artist" },
  { label: "Album", value: "album" },
  { label: "Duration", value: "duration" },
  { label: "File Size", value: "size" },
  { label: "Date Added", value: "dateAdded" },
];

const nameCollator = new Intl.Collator(undefined, { sensitivity: "base" });

function getSongTitle(song: MusicAsset) {
  const title = song.title?.trim();

  if (title) {
    return title;
  }

  return song.filename.replace(/\.[^/.]+$/, "");
}

function compareNames(first: string, second: string) {
  return nameCollator.compare(first, second);
}

function compareByString(
  first: string,
  second: string,
  fallback: number,
) {
  const diff = compareNames(first, second);

  return diff === 0 ? fallback : diff;
}

function compareByNumberDescending(
  first: number,
  second: number,
  fallback: number,
) {
  const diff = second - first;

  return diff === 0 ? fallback : diff;
}

export function sortSongsByLibraryOption<T extends MusicAsset>(
  songs: T[],
  sortOption: LibrarySortOption,
) {
  return songs
    .map((song, index) => ({
      album: song.albumTitle?.trim() || "",
      artist: song.artist?.trim() || "",
      dateAdded: song.creationTime ?? 0,
      duration: song.duration ?? 0,
      index,
      size: song.fileSize ?? 0,
      song,
      title: getSongTitle(song),
    }))
    .sort((first, second) => {
      const nameCompare = compareNames(first.title, second.title);

      if (sortOption === "artist") {
        return compareByString(first.artist, second.artist, nameCompare);
      }

      if (sortOption === "album") {
        return compareByString(first.album, second.album, nameCompare);
      }

      if (sortOption === "duration") {
        return compareByNumberDescending(
          first.duration,
          second.duration,
          nameCompare,
        );
      }

      if (sortOption === "size") {
        return compareByNumberDescending(first.size, second.size, nameCompare);
      }

      if (sortOption === "dateAdded") {
        return compareByNumberDescending(
          first.dateAdded,
          second.dateAdded,
          nameCompare,
        );
      }

      return nameCompare || first.index - second.index;
    })
    .map(({ song }) => song);
}
