import type { MusicAsset } from "../../types/music";

export function mapSong(song: MusicAsset) {
  return {
    id: song.id,
    url: song.uri,
    title: song.title ?? song.filename.replace(/\.[^/.]+$/, ""),
    artist: song.artist ?? "Unknown Artist",
    album: song.albumTitle ?? "Unknown Album",
    artwork: undefined,
    duration: song.duration,
  };
}
