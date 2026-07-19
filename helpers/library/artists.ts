import type { LibraryArtist } from "../../store/library.store";
import type { MusicAsset } from "../../types/music";
import { UNKNOWN_ARTIST } from "../../types/music";

const artistSeparators =
  /\s*[,;]\s*|\s+\b(?:feat\.?|ft\.?|featuring|with|x)\b\s+|\s+[×&]\s+/i;
const placeholderArtist = /^(?:<unknown>|unknown(?: artist)?|n\/?a|none|null|-+)$/i;
const websiteInParentheses =
  /\(\s*(?:(?:https?:\/\/)?(?:www\.)?)[^\s()]+\.(?:com|net|org|in|co|info|site)\b[^)]*\)/gi;
const websiteWithWww = /(?:https?:\/\/)?www\.[^\s,;()]+/gi;

function normalizeArtistName(name: string) {
  return name
    .replace(websiteInParentheses, " ")
    .replace(websiteWithWww, " ")
    .replace(/<unknown>/gi, " ")
    .replace(/[|/]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,;()\-]+|[\s,;()\-]+$/g, "")
    .trim();
}

function getSongArtistNames(song: MusicAsset) {
  const artist = normalizeArtistName(song.artist ?? "");

  if (!artist) {
    return [UNKNOWN_ARTIST];
  }

  const artistNames = artist
    .split(artistSeparators)
    .map(normalizeArtistName)
    .filter((name) => name.length > 0 && !placeholderArtist.test(name));

  if (artistNames.length === 0) {
    return [UNKNOWN_ARTIST];
  }

  return [
    ...new Map(
      artistNames.map((name) => [name.toLocaleLowerCase(), name]),
    ).values(),
  ];
}

const getArtists = (songs: MusicAsset[]): LibraryArtist[] => {
  const artists = new Map<string, LibraryArtist>();

  songs.forEach((song) => {
    getSongArtistNames(song).forEach((name) => {
      const key = name.toLocaleLowerCase();
      const artist = artists.get(key) ?? { name, songs: [] };

      if (!artist.songs.some((artistSong) => artistSong.id === song.id)) {
        artist.songs.push(song);
      }

      artists.set(key, artist);
    });
  });

  return [...artists.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export { getArtists };
