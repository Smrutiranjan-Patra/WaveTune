import * as MediaLibrary from "expo-media-library";
import type { EventSubscription } from "expo-modules-core";
import type { AudioStatus } from "expo-audio";
import type { MusicAsset } from "../../types/music";
import { UNKNOWN_ALBUM, UNKNOWN_ARTIST } from "../../types/music";

import {
  getPlaybackPlayer,
  getPlaybackStatus,
  loadAndPlayUri,
  pausePlayback,
  resumePlayback,
  seekPlayback,
} from "./playback.service";

async function getPlayableTrackUri(track: MediaLibrary.Asset) {
  const assetInfo = await MediaLibrary.getAssetInfoAsync(track);
  const uri = assetInfo.localUri ?? assetInfo.uri ?? track.uri;

  if (!uri) {
    throw new Error("Track URI is missing");
  }

  return uri;
}

export async function playTrack(track: MediaLibrary.Asset) {
  if (!track.uri) {
    throw new Error("Track URI is missing");
  }

  const uri = await getPlayableTrackUri(track);
  const metadata = track as MusicAsset;
  const title =
    metadata.title?.trim() || track.filename.replace(/\.[^/.]+$/, "");
  const player = await loadAndPlayUri(uri, {
    albumTitle: metadata.albumTitle?.trim() || UNKNOWN_ALBUM,
    artist: metadata.artist?.trim() || UNKNOWN_ARTIST,
    title,
  });

  return {
    player,
    status: await getPlaybackStatus(),
  };
}

export async function pauseTrack() {
  await pausePlayback();
  return getPlaybackStatus();
}

export async function resumeTrack() {
  await resumePlayback();
  return getPlaybackStatus();
}

export async function seekTrack(positionSeconds: number) {
  await seekPlayback(positionSeconds);
  return getPlaybackStatus();
}

export async function subscribeToPlaybackStatus(
  listener: (status: AudioStatus) => void,
): Promise<EventSubscription> {
  const player = await getPlaybackPlayer();
  return player.addListener("playbackStatusUpdate", listener);
}
