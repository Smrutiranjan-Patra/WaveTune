// providers/AppProvider.tsx

import { useEffect, useState } from "react";
import { AppState, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

import { softShadow, useAppTheme } from "../components/DesignSystem";
import { useLibraryStore } from "../store/library.store";
import { subscribeToAudioLibraryChanges } from "../services/library/library-events.service";
import { usePlayerStore } from "../store/player.store";
import { useSettingsStore } from "../store/settings.store";
import { useUserLibraryStore } from "../store/user-library.store";
import {
  subscribeToNotificationPlaybackControls,
  updateNativeEqualizer,
  updateNativePlaybackModes,
} from "../services/player/notification-controls.service";

function WaveTuneMark({ compact = false }: { compact?: boolean }) {
  const theme = useAppTheme();
  const bars = [8, 18, 42, 78, 108, 70, 42, 22, 10];
  const width = compact ? 78 : 108;
  const height = compact ? 58 : 78;

  return (
    <View
      style={{
        alignItems: "center",
        height,
        justifyContent: "center",
        width,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: compact ? 3 : 4,
          height,
        }}
      >
        {bars.map((barHeight, index) => {
          const isCenter = index === Math.floor(bars.length / 2);
          const color =
            index < 3
              ? "#7C5CFF"
              : index > 5
                ? "#3882F6"
                : theme.accent;

          return (
            <View
              key={`${barHeight}-${index}`}
              style={{
                backgroundColor: color,
                borderRadius: 12,
                height: Math.max(6, barHeight * (compact ? 0.46 : 0.58)),
                opacity: isCenter ? 1 : 0.9,
                width: compact ? 5 : 7,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function DecorativeWave() {
  const theme = useAppTheme();

  return (
    <View
      pointerEvents="none"
      style={{
        bottom: 0,
        height: 96,
        left: 0,
        overflow: "hidden",
        position: "absolute",
        right: 0,
      }}
    >
      <View
        style={{
          backgroundColor: theme.isDark ? "#26344A" : "#ECEBFF",
          borderColor: theme.isDark ? "#39465D" : "#D9D8FF",
          borderRadius: 120,
          borderWidth: 1,
          height: 78,
          left: -28,
          opacity: theme.isDark ? 0.22 : 0.72,
          position: "absolute",
          top: 34,
          transform: [{ rotate: "-10deg" }],
          width: 190,
        }}
      />
      <View
        style={{
          backgroundColor: theme.isDark ? "#1B2F4A" : "#E8F0FF",
          borderColor: theme.isDark ? "#35557D" : "#CBDCFF",
          borderRadius: 130,
          borderWidth: 1,
          height: 86,
          opacity: theme.isDark ? 0.18 : 0.72,
          position: "absolute",
          right: -26,
          top: 24,
          transform: [{ rotate: "-14deg" }],
          width: 220,
        }}
      />
    </View>
  );
}

function AppStartupScreen({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  const theme = useAppTheme();
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (error) {
      setProgress(0);
      return;
    }

    setProgress(8);

    const timer = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress < 42) {
          return currentProgress + 6;
        }

        if (currentProgress < 72) {
          return currentProgress + 3;
        }

        if (currentProgress < 92) {
          return currentProgress + 1;
        }

        return currentProgress;
      });
    }, 280);

    return () => {
      clearInterval(timer);
    };
  }, [error]);

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: theme.background,
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 18,
      }}
    >
      <View
        style={[
          {
            alignItems: "center",
            backgroundColor: theme.isDark ? "#101826" : "#FDFDFF",
            borderColor: theme.border,
            borderRadius: 28,
            borderWidth: 1,
            gap: 0,
            minHeight: 520,
            overflow: "hidden",
            paddingBottom: 44,
            paddingHorizontal: 24,
            paddingTop: 86,
            width: "100%",
            maxWidth: 360,
          },
          softShadow(theme.isDark, "high"),
        ]}
      >
        {error ? (
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.isDark ? "#3A1820" : "#FFF1F2",
              borderRadius: 34,
              height: 68,
              justifyContent: "center",
              marginBottom: 22,
              width: 68,
            }}
          >
            <Ionicons
              color={theme.isDark ? "#FDA4AF" : "#E11D48"}
              name="warning-outline"
              size={30}
            />
          </View>
        ) : (
          <WaveTuneMark />
        )}
        <Text
          style={{
            color: theme.primary,
            fontSize: 26,
            fontWeight: "900",
            marginTop: error ? 0 : 16,
            textAlign: "center",
          }}
        >
          {error ? "Scan Failed" : "WaveTune"}
        </Text>
        <Text
          style={{
            color: theme.secondary,
            fontSize: 12,
            lineHeight: 17,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          {error
            ? error
            : "Your Music. Anywhere. Anytime."}
        </Text>
        {!error ? (
          <View
            style={{
              marginTop: 82,
              width: "100%",
            }}
          >
            <Text
              style={{
                color: theme.secondary,
                fontSize: 10,
                fontWeight: "700",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Scanning your music library...
            </Text>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.track,
                  borderRadius: 999,
                  flex: 1,
                  height: 6,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.accent,
                    borderRadius: 999,
                    height: "100%",
                    width: `${progress}%`,
                  }}
                />
              </View>
              <Text
                style={{
                  color: theme.accent,
                  fontSize: 10,
                  fontWeight: "800",
                  minWidth: 28,
                  textAlign: "right",
                }}
              >
                {progress}%
              </Text>
            </View>
          </View>
        ) : null}
        {error ? (
          <Pressable
            onPress={onRetry}
            style={{
              alignItems: "center",
              backgroundColor: theme.accent,
              borderRadius: 22,
              justifyContent: "center",
              marginTop: 4,
              minHeight: 42,
              paddingHorizontal: 18,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}>
              Retry
            </Text>
          </Pressable>
        ) : null}
        <DecorativeWave />
      </View>
    </View>
  );
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cleanupPlayer = usePlayerStore((state) => state.cleanupPlayer);
  const error = useLibraryStore((state) => state.error);
  const initialized = useLibraryStore((state) => state.initialized);
  const loadLibraryData = useLibraryStore((state) => state.loadLibraryData);
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);
  const equalizerPreset = useSettingsStore((state) => state.equalizerPreset);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const shuffleEnabled = usePlayerStore((state) => state.shuffleEnabled);
  const sleepTimerEndsAt = useSettingsStore(
    (state) => state.sleepTimerEndsAt,
  );

  useEffect(() => {
    const subscription = subscribeToNotificationPlaybackControls((control) => {
      const player = usePlayerStore.getState();

      if (control === "next") void player.playNext();
      if (control === "previous") void player.playPrevious();
      if (control === "shuffle") player.toggleShuffle();
      if (control === "repeat") player.cycleRepeatMode();
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    let refreshingStatus = false;

    const refreshPlaybackStatus = async () => {
      if (refreshingStatus || AppState.currentState !== "active") {
        return;
      }

      refreshingStatus = true;
      await usePlayerStore.getState().refreshPlaybackStatus();
      refreshingStatus = false;
    };

    const interval = setInterval(() => {
      void refreshPlaybackStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    updateNativeEqualizer(equalizerPreset);
  }, [equalizerPreset]);

  useEffect(() => {
    updateNativePlaybackModes(shuffleEnabled, repeatMode);
  }, [repeatMode, shuffleEnabled]);

  useEffect(() => {
    if (!sleepTimerEndsAt) return;

    const finishTimer = () => {
      const settings = useSettingsStore.getState();
      void usePlayerStore.getState().pause();
      settings.setSleepTimerMinutes(null);
    };
    const remaining = sleepTimerEndsAt - Date.now();

    if (remaining <= 0) {
      finishTimer();
      return;
    }

    const timer = setTimeout(finishTimer, remaining);
    return () => clearTimeout(timer);
  }, [sleepTimerEndsAt]);

  useEffect(() => {
    const initializeApp = async () => {
      const hydrateSettings = useSettingsStore.getState().hydrateSettings;
      const hydrateUserLibrary = useUserLibraryStore.getState().hydrateUserLibrary;
      const startupTasks = [initializePlayer()];

      if (typeof hydrateSettings === "function") {
        startupTasks.push(hydrateSettings());
      }

      if (typeof hydrateUserLibrary === "function") {
        startupTasks.push(hydrateUserLibrary());
      }

      await Promise.allSettled([...startupTasks]);
      await loadLibraryData();
    };

    void initializeApp();

    return () => {
      void cleanupPlayer();
    };
  }, [cleanupPlayer, initializePlayer, loadLibraryData]);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleLibraryRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);

      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        void loadLibraryData();
      }, 1200);
    };

    const mediaLibrarySubscription = MediaLibrary.addListener(
      scheduleLibraryRefresh,
    );
    const audioLibrarySubscription = subscribeToAudioLibraryChanges(
      scheduleLibraryRefresh,
    );
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          void usePlayerStore.getState().refreshPlaybackStatus();
          scheduleLibraryRefresh();
        }
      },
    );

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      mediaLibrarySubscription.remove();
      audioLibrarySubscription?.remove();
      appStateSubscription.remove();
    };
  }, [loadLibraryData]);

  if (!initialized || error) {
    return (
      <AppStartupScreen
        error={error}
        onRetry={() => {
          void loadLibraryData();
        }}
      />
    );
  }

  return children;
}
