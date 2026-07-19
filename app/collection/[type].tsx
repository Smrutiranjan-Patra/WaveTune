import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type * as MediaLibrary from "expo-media-library";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  getTrackArtist,
  getTrackTitle,
  useAppTheme,
} from "../../components/DesignSystem";
import { SongListRow } from "../../components/SongListRow";
import { useLibraryStore } from "../../store/library.store";
import { usePlayerStore } from "../../store/player.store";
import { useUserLibraryStore } from "../../store/user-library.store";

type CollectionType = "favorites" | "most-played" | "recent";

const collectionTitles: Record<CollectionType, string> = {
  favorites: "Favorites",
  "most-played": "Most Played",
  recent: "Recently Played",
};

function isCollectionType(type: string | undefined): type is CollectionType {
  return type === "favorites" || type === "most-played" || type === "recent";
}

export default function CollectionScreen() {
  const theme = useAppTheme();
  const { type: typeParam } = useLocalSearchParams<{ type?: string }>();
  const type = isCollectionType(typeParam) ? typeParam : "recent";
  const songs = useLibraryStore((state) => state.songs);
  const favoriteSongIds = useUserLibraryStore((state) => state.favoriteSongIds);
  const history = useUserLibraryStore((state) => state.history);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const pause = usePlayerStore((state) => state.pause);
  const playSong = usePlayerStore((state) => state.playSong);
  const resume = usePlayerStore((state) => state.resume);
  const songsById = new Map(songs.map((song) => [song.id, song]));

  let collection: MediaLibrary.Asset[];

  if (type === "favorites") {
    collection = favoriteSongIds
      .map((id) => songsById.get(id))
      .filter(Boolean) as MediaLibrary.Asset[];
  } else {
    const entries =
      type === "most-played"
        ? [...history].sort((a, b) => b.playCount - a.playCount)
        : history;
    collection = entries
      .map((entry) => songsById.get(entry.songId))
      .filter(Boolean) as MediaLibrary.Asset[];
  }

  const handlePress = async (song: MediaLibrary.Asset) => {
    if (currentTrack?.id !== song.id) {
      await playSong(song, collection);
      return;
    }

    if (isPlaying) {
      await pause();
      return;
    }

    await resume();
  };

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          gap: 12,
          paddingBottom: 12,
          paddingHorizontal: 18,
          paddingTop: 10,
        }}
      >
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => router.back()}
          style={{
            alignItems: "center",
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 18,
            borderWidth: 1,
            height: 36,
            justifyContent: "center",
            width: 36,
          }}
        >
          <Ionicons name="chevron-back" color={theme.primary} size={20} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: theme.primary, fontSize: 22, fontWeight: "900" }}
          >
            {collectionTitles[type]}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 11, marginTop: 1 }}>
            {collection.length} {collection.length === 1 ? "song" : "songs"}
          </Text>
        </View>
      </View>

      <FlatList
        data={collection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 154,
          paddingHorizontal: 22,
          paddingTop: 4,
        }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              gap: 8,
              marginTop: 12,
              padding: 24,
            }}
          >
            <Ionicons
              name="musical-notes-outline"
              color={theme.accent}
              size={26}
            />
            <Text
              style={{ color: theme.primary, fontSize: 14, fontWeight: "900" }}
            >
              No songs here yet
            </Text>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Play songs or add favorites and they will appear here.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isCurrent = currentTrack?.id === item.id;

          return (
            <SongListRow
              artworkSource={item}
              artist={getTrackArtist(item)}
              duration={item.duration}
              index={index}
              isCurrentTrack={isCurrent}
              isPlaying={isPlaying}
              onDetailPress={() => router.push(`/song/${item.id}`)}
              onPress={() => void handlePress(item)}
              title={getTrackTitle(item)}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
