import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type * as MediaLibrary from "expo-media-library";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import {
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { SongListRow } from "../../components/SongListRow";
import { useLibraryStore } from "../../store/library.store";
import { usePlayerStore } from "../../store/player.store";

export default function SearchScreen() {
  const theme = useAppTheme();
  const [query, setQuery] = useState("");
  const songs = useLibraryStore((state) => state.songs);
  const { currentTrack, isPlaying, pause, playSong, resume } = usePlayerStore();
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return songs.filter((song) =>
      getTrackTitle(song.filename)
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, songs]);

  const handlePress = async (song: MediaLibrary.Asset) => {
    if (currentTrack?.id !== song.id) {
      await playSong(song, results);
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
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 154,
          paddingHorizontal: 22,
          paddingTop: 12,
        }}
        ListHeaderComponent={
          <View style={{ gap: 18, paddingBottom: normalizedQuery ? 8 : 0 }}>
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
            >
              <View
                style={[
                  {
                    alignItems: "center",
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderRadius: 24,
                    borderWidth: 1,
                    flex: 1,
                    flexDirection: "row",
                    gap: 10,
                    minHeight: 48,
                    paddingHorizontal: 16,
                  },
                  softShadow(theme.isDark, "medium"),
                ]}
              >
                <Ionicons name="search" color={theme.accent} size={19} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  onChangeText={setQuery}
                  placeholder="Search songs"
                  placeholderTextColor={theme.secondary}
                  returnKeyType="search"
                  style={{
                    color: theme.primary,
                    flex: 1,
                    fontSize: 13,
                    paddingVertical: 12,
                  }}
                  value={query}
                />
                {query ? (
                  <Pressable
                    accessibilityLabel="Clear search"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setQuery("")}
                  >
                    <Ionicons
                      name="close-circle"
                      color={theme.secondary}
                      size={19}
                    />
                  </Pressable>
                ) : null}
              </View>

              <Pressable
                accessibilityLabel="Hide search"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => router.replace("/(tabs)/home")}
                style={[
                  {
                    alignItems: "center",
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderRadius: 22,
                    borderWidth: 1,
                    height: 44,
                    justifyContent: "center",
                    width: 44,
                  },
                  softShadow(theme.isDark, "low"),
                ]}
              >
                <Ionicons name="close" color={theme.primary} size={21} />
              </Pressable>
            </View>

            {normalizedQuery ? (
              <Text style={{ color: theme.secondary, fontSize: 12 }}>
                {results.length} {results.length === 1 ? "result" : "results"}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          normalizedQuery ? (
            <View
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderRadius: 16,
                borderWidth: 1,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 13,
                  fontWeight: "900",
                }}
              >
                No matching songs
              </Text>
              <Text
                style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}
              >
                Try another song title.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const isCurrentTrack = currentTrack?.id === item.id;

          return (
            <SongListRow
              artist={getTrackArtist(index)}
              duration={item.duration}
              index={index}
              isCurrentTrack={isCurrentTrack}
              isPlaying={isPlaying}
              onDetailPress={() => router.push(`/song/${item.id}`)}
              onPress={() => void handlePress(item)}
              title={getTrackTitle(item.filename)}
            />
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
