import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Artwork, formatTime, softShadow, useAppTheme } from "./DesignSystem";

export function SongListRow({
  artist,
  duration,
  index,
  isCurrentTrack,
  isPlaying,
  onDetailPress,
  onPress,
  title,
}: {
  artist: string;
  duration?: number;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onDetailPress?: () => void;
  onPress?: () => void;
  title: string;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          alignItems: "center",
          backgroundColor: isCurrentTrack ? `${theme.accent}18` : theme.card,
          borderColor: isCurrentTrack ? theme.accent : theme.border,
          borderRadius: 14,
          borderWidth: 1,
          flexDirection: "row",
          padding: 10,
        },
        softShadow(theme.isDark, "low"),
      ]}
    >
      <Pressable
        onPress={onPress}
        style={{
          alignItems: "center",
          flex: 1,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <Artwork size={46} index={index} />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={{ color: theme.secondary, fontSize: 11 }}
          >
            {artist}
          </Text>
        </View>
        <Text style={{ color: theme.secondary, fontSize: 11 }}>
          {formatTime(duration ?? 190)}
        </Text>
      </Pressable>
      <Pressable
        onPress={onDetailPress}
        hitSlop={10}
        style={{
          alignItems: "center",
          height: 32,
          justifyContent: "center",
          width: 32,
        }}
      >
        <Ionicons
          name={isCurrentTrack && isPlaying ? "pause" : "ellipsis-vertical"}
          color={isCurrentTrack ? theme.accent : theme.secondary}
          size={18}
        />
      </Pressable>
    </View>
  );
}
