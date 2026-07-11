import { Asset } from "expo-media-library";

export function mapSong(song: Asset) {
  return {
    id: song.id,
    url: song.uri,
    title: song.filename.replace(/\.[^/.]+$/, ""),
    artist: "Unknown Artist",
    album: "Unknown Album",
    artwork: undefined,
    duration: song.duration,
  };
}
