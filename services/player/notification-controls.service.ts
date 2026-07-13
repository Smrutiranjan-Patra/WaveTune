import {
  requireOptionalNativeModule,
  type EventSubscription,
} from "expo-modules-core";

import type { EqualizerPreset } from "../../store/settings.store";
import type { RepeatMode } from "../../store/player.store";

export type NotificationPlaybackControl =
  | "next"
  | "previous"
  | "repeat"
  | "shuffle";

type PlaybackControlsNativeModule = {
  addListener: (
    eventName: "waveTunePlaybackControl",
    listener: (event: { control: NotificationPlaybackControl }) => void,
  ) => EventSubscription;
  setWaveTuneEqualizerPreset: (preset: EqualizerPreset) => void;
  setWaveTunePlaybackModes: (
    shuffleEnabled: boolean,
    repeatMode: RepeatMode,
  ) => void;
};

const nativeModule = requireOptionalNativeModule("ExpoAudio") as
  | PlaybackControlsNativeModule
  | null;

export function subscribeToNotificationPlaybackControls(
  listener: (control: NotificationPlaybackControl) => void,
): EventSubscription | null {
  if (!nativeModule) return null;

  return nativeModule.addListener(
    "waveTunePlaybackControl",
    ({ control }) => listener(control),
  );
}

export function updateNativeEqualizer(preset: EqualizerPreset) {
  nativeModule?.setWaveTuneEqualizerPreset(preset);
}

export function updateNativePlaybackModes(
  shuffleEnabled: boolean,
  repeatMode: RepeatMode,
) {
  nativeModule?.setWaveTunePlaybackModes(shuffleEnabled, repeatMode);
}
