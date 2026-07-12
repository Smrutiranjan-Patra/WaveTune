import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

import { softShadow, useAppTheme } from "./DesignSystem";
import { usePlayerStore } from "../store/player.store";

export default function FloatingSearchButton({
  hidden,
  miniPlayerRevealed,
  onHide,
  onShowMiniPlayer,
}: {
  hidden: boolean;
  miniPlayerRevealed: boolean;
  onHide: () => void;
  onShowMiniPlayer: () => void;
}) {
  const theme = useAppTheme();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const slideProgress = useRef(new Animated.Value(hidden ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(slideProgress, {
      duration: 240,
      toValue: hidden ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [hidden, slideProgress]);

  return (
    <>
      {hidden && currentTrack && !miniPlayerRevealed ? (
        <Pressable
          accessibilityLabel="Show MiniPlayer"
          accessibilityRole="button"
          onPress={onShowMiniPlayer}
          style={[
            {
              alignItems: "flex-end",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 24,
              borderWidth: 1,
              bottom: 90,
              height: 48,
              justifyContent: "center",
              left: -14,
              paddingRight: 8,
              position: "absolute",
              width: 48,
              zIndex: 20,
            },
            softShadow(theme.isDark, "medium"),
          ]}
        >
          <Ionicons name="musical-note" color={theme.accent} size={19} />
        </Pressable>
      ) : null}

      {hidden ? (
        <Pressable
          accessibilityLabel="Open search"
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/search")}
          style={[
            {
              alignItems: "flex-start",
              backgroundColor: theme.accent,
              borderColor: theme.isDark ? "#857EFF" : "#FFFFFF",
              borderRadius: 24,
              borderWidth: 2,
              bottom: 90,
              height: 48,
              justifyContent: "center",
              paddingLeft: 8,
              position: "absolute",
              right: -14,
              width: 48,
              zIndex: 20,
            },
            softShadow(theme.isDark, "medium"),
          ]}
        >
          <Ionicons name="search" color="#FFFFFF" size={19} />
        </Pressable>
      ) : null}

      <Animated.View
        pointerEvents={hidden ? "none" : "box-none"}
        style={{
          bottom: 85,
          height: 72,
          opacity: slideProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
          position: "absolute",
          right: 12,
          transform: [
            {
              translateX: slideProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 84],
              }),
            },
          ],
          width: 64,
          zIndex: 20,
        }}
      >
        <Pressable
          accessibilityLabel="Search music"
          accessibilityRole="button"
          onPress={() => router.push("/(tabs)/search")}
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.accent,
              borderColor: theme.isDark ? "#857EFF" : "#FFFFFF",
              borderRadius: 29,
              borderWidth: 2,
              bottom: 0,
              height: 58,
              justifyContent: "center",
              position: "absolute",
              left: 0,
              width: 58,
            },
            softShadow(theme.isDark, "high"),
          ]}
        >
          <Ionicons name="search" color="#FFFFFF" size={25} />
        </Pressable>

        <Pressable
          accessibilityLabel="Hide player and search"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onHide}
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 15,
              borderWidth: 1,
              height: 30,
              justifyContent: "center",
              position: "absolute",
              right: 0,
              top: 0,
              width: 30,
              zIndex: 1,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Ionicons name="chevron-down" color={theme.secondary} size={17} />
        </Pressable>
      </Animated.View>
    </>
  );
}
