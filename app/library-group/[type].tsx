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

type GroupType = "album" | "artist" | "folder" | "genre";

function isGroupType(type: string | undefined): type is GroupType {
  return (
    type === "album" ||
    type === "artist" ||
    type === "folder" ||
    type === "genre"
  );
}

export default function LibraryGroupScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{
    key?: string;
    title?: string;
    type?: string;
  }>();
  const type = isGroupType(params.type) ? params.type : "album";
  const albums = useLibraryStore((state) => state.albums);
  const artists = useLibraryStore((state) => state.artists);
  const folders = useLibraryStore((state) => state.folders);
  const genres = useLibraryStore((state) => state.genres);
  const { currentTrack, isPlaying, pause, playSong, resume } = usePlayerStore();
  let songs: MediaLibrary.Asset[] = [];
  let fallbackTitle = "Songs";

  if (type === "album") {
    const album = albums.find((item) => item.id === params.key);
    songs = album?.songs ?? [];
    fallbackTitle = album?.name ?? "Album";
  } else if (type === "artist") {
    const artist = artists.find((item) => item.name === params.key);
    songs = artist?.songs ?? [];
    fallbackTitle = artist?.name ?? "Artist";
  } else if (type === "genre") {
    const genre = genres.find((item) => item.name === params.key);
    songs = genre?.songs ?? [];
    fallbackTitle = genre?.name ?? "Genre";
  } else {
    const folder = folders.find((item) => item.path === params.key);
    songs = folder?.songs ?? [];
    fallbackTitle = folder?.name ?? "Folder";
  }

  const title = params.title || fallbackTitle;

  const handlePress = async (song: MediaLibrary.Asset) => {
    if (currentTrack?.id !== song.id) {
      await playSong(song, songs);
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
            numberOfLines={1}
            style={{ color: theme.primary, fontSize: 22, fontWeight: "900" }}
          >
            {title}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 11, marginTop: 1 }}>
            {songs.length} {songs.length === 1 ? "song" : "songs"}
          </Text>
        </View>
      </View>

      <FlatList
        data={songs}
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
              No songs found
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isCurrentTrack = currentTrack?.id === item.id;

          return (
            <SongListRow
              artworkSource={item}
              artist={getTrackArtist(item)}
              duration={item.duration}
              index={index}
              isCurrentTrack={isCurrentTrack}
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
