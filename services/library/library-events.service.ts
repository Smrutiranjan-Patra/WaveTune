import {
  requireOptionalNativeModule,
  type EventSubscription,
} from "expo-modules-core";
import { Platform } from "react-native";

type WaveTuneNativeModule = {
  addListener: (
    eventName: "audioLibraryChanged",
    listener: () => void,
  ) => EventSubscription;
};

const nativeModule = requireOptionalNativeModule("WaveTuneAudioRoute") as
  | WaveTuneNativeModule
  | null;

export function subscribeToAudioLibraryChanges(
  listener: () => void,
): EventSubscription | null {
  if (Platform.OS !== "android" || !nativeModule) return null;

  return nativeModule.addListener("audioLibraryChanged", listener);
}
