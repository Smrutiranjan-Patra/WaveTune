import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Artwork, getTrackTitle, softShadow, useAppTheme } from "./DesignSystem";
import { usePlayerStore } from "../store/player.store";

export default function MiniPlayer() {
  const theme = useAppTheme();
  const pathname = usePathname();
  const { currentTrack, duration, isPlaying, position, togglePlayback } =
    usePlayerStore();

  if (!currentTrack || pathname === "/player") {
    return null;
  }

  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <Pressable
      onPress={() => {
        router.push("/player");
      }}
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 76,
        borderRadius: 16,
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
        overflow: "hidden",
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
            {getTrackTitle(currentTrack.filename)}
          </Text>
          <Text numberOfLines={1} style={{ color: theme.secondary, fontSize: 11 }}>
            Now playing
          </Text>
        </View>
        
        <Pressable
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
  );
}
