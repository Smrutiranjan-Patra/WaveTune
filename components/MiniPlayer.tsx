import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Artwork,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "./DesignSystem";
import { usePlayerStore } from "../store/player.store";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function MiniPlayer({
  hidden = false,
  reserveSearchSpace = false,
}: {
  hidden?: boolean;
  reserveSearchSpace?: boolean;
}) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(hidden ? -width : 0)).current;
  const {
    currentTrack,
    duration,
    isPlaying,
    position,
    togglePlayback,
  } = usePlayerStore();

  useEffect(() => {
    Animated.timing(translateX, {
      duration: 240,
      toValue: hidden ? -width : 0,
      useNativeDriver: true,
    }).start();
  }, [hidden, translateX, width]);

  if (!currentTrack || pathname === "/player") {
    return null;
  }

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <AnimatedPressable
      pointerEvents={hidden ? "none" : "auto"}
      onPress={() => {
        router.push("/player");
      }}
      style={{
        position: "absolute",
        left: 15,
        right: reserveSearchSpace ? 88 : 40,
        bottom: 85,
        borderRadius: 16,
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
        overflow: "hidden",
        transform: [{ translateX }],
        ...softShadow(theme.isDark, "high"),
      }}
    >
      <View
        style={{
          height: 3,
          width: `${progress * 100}%`,
          backgroundColor: theme.accent,
        }}
      />

      <View
        style={{
          minHeight: 58,
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Artwork size={42} index={1} />

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: theme.primary, fontSize: 13, fontWeight: "800" }}
          >
            {getTrackTitle(currentTrack)}
          </Text>
          <Text
            numberOfLines={1}
            style={{ color: theme.secondary, fontSize: 11 }}
          >
            Now playing
          </Text>
        </View>

        <Pressable
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          accessibilityRole="button"
          onPress={(event) => {
            event.stopPropagation();
            void togglePlayback();
          }}
          hitSlop={12}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: theme.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            color="#FFFFFF"
            size={22}
          />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}
