import { Ionicons } from "@expo/vector-icons";
import type * as MediaLibrary from "expo-media-library";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  Artwork,
  formatTime,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";
import { usePlayerStore } from "../../../store/player.store";

const fallbackSongs = [
  "Sunflower",
  "Shape of You",
  "Someone You Loved",
  "Believer",
  "Memories",
  "Blinding Lights",
];

function EmptyLibrary() {
  const theme = useAppTheme();

  return (
    <View style={{ gap: 10, paddingTop: 6 }}>
      {fallbackSongs.map((title, index) => (
        <SongRow
          index={index}
          key={title}
          title={title}
          artist={getTrackArtist(index + 1)}
          duration={198 + index * 7}
          isCurrentTrack={false}
          isPlaying={false}
        />
      ))}
      <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 6 }}>
        Scan your device library to replace these design samples with your songs.
      </Text>
    </View>
  );
}

function SongRow({
  artist,
  duration,
  index,
  isCurrentTrack,
  isPlaying,
  onPress,
  title,
}: {
  artist: string;
  duration?: number;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onPress?: () => void;
  title: string;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          alignItems: "center",
          backgroundColor: isCurrentTrack ? `${theme.accent}18` : theme.card,
          borderColor: isCurrentTrack ? theme.accent : theme.border,
          borderRadius: 14,
          borderWidth: 1,
          flexDirection: "row",
          gap: 12,
          padding: 10,
        },
        softShadow(theme.isDark, "low"),
      ]}
    >
      <Artwork size={46} index={index} />
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}
        >
          {title}
        </Text>
        <Text numberOfLines={1} style={{ color: theme.secondary, fontSize: 11 }}>
          {artist}
        </Text>
      </View>
      <Text style={{ color: theme.secondary, fontSize: 11 }}>
        {formatTime(duration ?? 190)}
      </Text>
      <Ionicons
        name={isCurrentTrack && isPlaying ? "pause" : "ellipsis-vertical"}
        color={isCurrentTrack ? theme.accent : theme.secondary}
        size={18}
      />
    </Pressable>
  );
}

export default function Songs() {
  const theme = useAppTheme();
  const { songs } = useLibraryStore();
  const { currentTrack, error, isPlaying, pause, playSong, resume } =
    usePlayerStore();

  const handlePress = async (item: MediaLibrary.Asset, isCurrentTrack: boolean) => {
    if (!isCurrentTrack) {
      await playSong(item, songs);
      return;
    }

    if (isPlaying) {
      await pause();
      return;
    }

    await resume();
  };

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 10,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 8,
      }}
      ListHeaderComponent={
        <View style={{ gap: 12, paddingBottom: 4 }}>
          {error ? (
            <View
              style={{
                backgroundColor: theme.isDark ? "#3A1820" : "#FFF1F2",
                borderColor: theme.isDark ? "#7F1D2D" : "#FDA4AF",
                borderRadius: 14,
                borderWidth: 1,
                padding: 12,
              }}
            >
              <Text style={{ color: theme.isDark ? "#FDA4AF" : "#9F1239" }}>
                {error}
              </Text>
            </View>
          ) : null}
          {!songs.length ? <EmptyLibrary /> : null}
        </View>
      }
      renderItem={({ item, index }) => {
        const isCurrentTrack = currentTrack?.id === item.id;

        return (
          <SongRow
            artist={getTrackArtist(index)}
            duration={item.duration}
            index={index}
            isCurrentTrack={isCurrentTrack}
            isPlaying={isPlaying}
            onPress={() => {
              void handlePress(item, isCurrentTrack);
            }}
            title={getTrackTitle(item.filename)}
          />
        );
      }}
    />
  );
}
