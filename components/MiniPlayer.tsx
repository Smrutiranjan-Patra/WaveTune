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

export default function MiniPlayer({
  hidden = false,
  onSwipeLeft,
  reserveSearchSpace = false,
}: {
  hidden?: boolean;
  onSwipeLeft?: () => void;
  reserveSearchSpace?: boolean;
}) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(hidden ? -width : 0)).current;
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const duration = usePlayerStore((state) => state.duration);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);
  const swipeStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

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
  const resetMiniPlayerPosition = () => {
    Animated.spring(translateX, {
      friction: 8,
      tension: 90,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleTouchStart = (event: { nativeEvent: { pageX: number } }) => {
    didSwipe.current = false;
    swipeStartX.current = event.nativeEvent.pageX;
    translateX.stopAnimation();
  };

  const handleTouchMove = (event: { nativeEvent: { pageX: number } }) => {
    if (swipeStartX.current === null) {
      return;
    }

    const distance = event.nativeEvent.pageX - swipeStartX.current;

    if (distance < -8) {
      didSwipe.current = true;
      translateX.setValue(Math.max(distance, -width));
    }
  };

  const handleTouchEnd = (event: { nativeEvent: { pageX: number } }) => {
    if (swipeStartX.current === null) {
      return;
    }

    const distance = event.nativeEvent.pageX - swipeStartX.current;
    swipeStartX.current = null;

    if (didSwipe.current && distance <= -40) {
      Animated.timing(translateX, {
        duration: 180,
        toValue: -width,
        useNativeDriver: true,
      }).start(() => onSwipeLeft?.());
      return;
    }

    didSwipe.current = false;
    resetMiniPlayerPosition();
  };

  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "auto"}
      style={{
        position: "absolute",
        left: 15,
        right: reserveSearchSpace ? 88 : 40,
        bottom: 100,
        borderRadius: 16,
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
        overflow: "hidden",
        transform: [{ translateX }],
        ...softShadow(theme.isDark, "high"),
        elevation: 30,
        zIndex: 30,
      }}
    >
      <Pressable
        accessibilityLabel={`Open player for ${getTrackTitle(currentTrack)}`}
        accessibilityRole="button"
        onPress={() => {
          if (didSwipe.current) {
            didSwipe.current = false;
            return;
          }

          router.navigate("/player");
        }}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
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
          <Artwork size={42} index={1} source={currentTrack} />

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
      </Pressable>
    </Animated.View>
  );
}
