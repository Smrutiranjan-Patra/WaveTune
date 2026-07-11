import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { usePlayerStore } from "../store/player.store";

function getTrackTitle(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

export default function MiniPlayer() {
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
        left: 12,
        right: 12,
        bottom: 70,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }}
    >
      <View
        style={{
          height: 3,
          width: `${progress * 100}%`,
          backgroundColor: "#4F46E5",
        }}
      />

      <View
        style={{
          minHeight: 58,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 6,
            backgroundColor: "#4F46E5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="musical-note" color="#4F46E5" size={20} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: "#4F46E5", fontSize: 14, fontWeight: "700" }}
          >
            {getTrackTitle(currentTrack.filename)}
          </Text>
          <Text numberOfLines={1} style={{ color: "#9CA3AF", fontSize: 12 }}>
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
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            color="#4F46E5"
            size={26}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
