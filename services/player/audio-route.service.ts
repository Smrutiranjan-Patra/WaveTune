import {
  requireOptionalNativeModule,
  type EventSubscription,
} from "expo-modules-core";
import { Platform } from "react-native";

export type AudioOutputRoute = {
  description?: string | null;
  id: string;
  name: string;
  selected: boolean;
  type: "bluetooth" | "device" | "speaker" | "tv";
};

type AudioRouteNativeModule = {
  addListener: (
    eventName: "audioRoutesChanged",
    listener: (event: { routes: AudioOutputRoute[] }) => void,
  ) => EventSubscription;
  getAudioRoutes: () => Promise<AudioOutputRoute[]>;
  selectAudioRoute: (routeId: string) => Promise<boolean>;
};

const audioRouteModule = requireOptionalNativeModule("WaveTuneAudioRoute") as
  | AudioRouteNativeModule
  | null;

function requireAudioRouteModule() {
  if (Platform.OS !== "android") {
    throw new Error("Audio output selection is currently available on Android.");
  }

  if (!audioRouteModule) {
    throw new Error(
      "Audio output controls require a fresh Android development build.",
    );
  }

  return audioRouteModule;
}

export function getAudioOutputRoutes() {
  return requireAudioRouteModule().getAudioRoutes();
}

export function selectAudioOutputRoute(routeId: string) {
  return requireAudioRouteModule().selectAudioRoute(routeId);
}

export function subscribeToAudioOutputRoutes(
  listener: (routes: AudioOutputRoute[]) => void,
): EventSubscription | null {
  if (Platform.OS !== "android" || !audioRouteModule) return null;

  return audioRouteModule.addListener(
    "audioRoutesChanged",
    ({ routes }) => listener(routes),
  );
}
