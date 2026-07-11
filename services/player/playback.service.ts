import { requireOptionalNativeModule } from "expo-modules-core";
import type { AudioPlayer, AudioStatus, AudioSource } from "expo-audio";

let player: AudioPlayer | null = null;
let audioModeConfigured = false;
let expoAudioModule: typeof import("expo-audio") | null = null;

export const playbackUnavailableMessage =
  "ExpoAudio native module is unavailable. Rebuild the Android app after installing expo-audio, and do not test this path in an old dev client or Expo Go.";

async function getExpoAudio() {
  if (expoAudioModule) {
    return expoAudioModule;
  }

  const nativeModule = requireOptionalNativeModule("ExpoAudio");

  if (!nativeModule) {
    throw new Error(playbackUnavailableMessage);
  }

  try {
    expoAudioModule = await import("expo-audio");
    return expoAudioModule;
  } catch {
    throw new Error(playbackUnavailableMessage);
  }
}

function getSource(uri: string): AudioSource {
  return { uri };
}

export async function configurePlaybackMode() {
  if (audioModeConfigured) {
    return;
  }

  const { setAudioModeAsync, setIsAudioActiveAsync } = await getExpoAudio();

  await setIsAudioActiveAsync(true);
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: "doNotMix",
    allowsRecording: false,
    shouldPlayInBackground: true,
    shouldRouteThroughEarpiece: false,
  });

  audioModeConfigured = true;
}

export async function resetAbandonedPlayback() {
  try {
    const { setIsAudioActiveAsync } = await getExpoAudio();

    if (player) {
      player.remove();
      player = null;
    }

    audioModeConfigured = false;
    await setIsAudioActiveAsync(false);
  } catch {
    // Native audio may be unavailable in Expo Go or stale dev builds.
    // Playback attempts still surface the guarded error message.
  }
}

export async function deactivatePlayback() {
  try {
    const { setIsAudioActiveAsync } = await getExpoAudio();

    if (player) {
      player.pause();
      player.remove();
      player = null;
    }

    audioModeConfigured = false;
    await setIsAudioActiveAsync(false);
  } catch {
    // Best-effort cleanup for dev refresh and app teardown.
  }
}

export async function getPlaybackPlayer() {
  if (!player) {
    const { createAudioPlayer } = await getExpoAudio();

    player = createAudioPlayer(null, {
      updateInterval: 250,
      keepAudioSessionActive: true,
    });
  }

  return player;
}

export async function loadAndPlayUri(uri: string) {
  await configurePlaybackMode();

  const playbackPlayer = await getPlaybackPlayer();
  playbackPlayer.replace(getSource(uri));
  playbackPlayer.play();

  return playbackPlayer;
}

export async function pausePlayback() {
  const playbackPlayer = await getPlaybackPlayer();
  playbackPlayer.pause();
}

export async function resumePlayback() {
  const playbackPlayer = await getPlaybackPlayer();
  playbackPlayer.play();
}

export async function seekPlayback(positionSeconds: number) {
  const playbackPlayer = await getPlaybackPlayer();
  await playbackPlayer.seekTo(positionSeconds);
}

export async function getPlaybackStatus(): Promise<AudioStatus> {
  const playbackPlayer = await getPlaybackPlayer();
  return playbackPlayer.currentStatus;
}

export function releasePlayback() {
  if (!player) {
    return;
  }

  player.remove();
  player = null;
  audioModeConfigured = false;
}
