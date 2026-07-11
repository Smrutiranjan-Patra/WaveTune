import * as MediaLibrary from "expo-media-library";
import type { EventSubscription } from "expo-modules-core";
import type { AudioStatus } from "expo-audio";

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
  const player = await loadAndPlayUri(uri);

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
