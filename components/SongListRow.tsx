import { Ionicons } from "@expo/vector-icons";
import type * as MediaLibrary from "expo-media-library";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Artwork, formatTime, softShadow, useAppTheme } from "./DesignSystem";

export function SongListRow({
  artworkSource,
  artist,
  duration,
  index,
  isCurrentTrack,
  onDetailPress,
  onPress,
  rightAccessory,
  title,
}: {
  artworkSource?: MediaLibrary.Asset;
  artist: string;
  duration?: number;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onDetailPress?: () => void;
  onPress?: () => void;
  rightAccessory?: ReactNode;
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
        <Artwork size={46} index={index} source={artworkSource} />
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
      {rightAccessory ?? (
        <Pressable
          accessibilityLabel={`View information for ${title}`}
          accessibilityRole="button"
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
            name="information-circle-outline"
            color={isCurrentTrack ? theme.accent : theme.secondary}
            size={20}
          />
        </Pressable>
      )}
    </View>
  );
}
