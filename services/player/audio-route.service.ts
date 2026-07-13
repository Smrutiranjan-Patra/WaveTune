import { NativeModules, Platform } from "react-native";

export type AudioOutputRoute = {
  description?: string | null;
  id: string;
  name: string;
  selected: boolean;
  type: "bluetooth" | "device" | "speaker" | "tv";
};

type AudioRouteNativeModule = {
  getAudioRoutes: () => Promise<AudioOutputRoute[]>;
  selectAudioRoute: (routeId: string) => Promise<boolean>;
};

const audioRouteModule = NativeModules.WaveTuneAudioRoute as
  | AudioRouteNativeModule
  | undefined;

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
