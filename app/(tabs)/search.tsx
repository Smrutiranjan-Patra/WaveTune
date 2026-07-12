import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import {
  Artwork,
  SectionHeader,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { useLibraryStore } from "../../store/library.store";

const recentSearches = ["Sunflower", "Ed Sheeran", "Memories", "The Weeknd"];
const genres = ["Pop", "Hip Hop", "Rock", "Lo-Fi", "Electronic"];

export default function SearchScreen() {
  const theme = useAppTheme();
  const [query, setQuery] = useState("");
  const songs = useLibraryStore((state) => state.songs);

  const results = useMemo(() => {
    if (!songs.length) {
      return [
        { artist: "Post Malone, Swae Lee", id: "sunflower", title: "Sunflower" },
        { artist: "Ed Sheeran", id: "shape-of-you", title: "Shape of You" },
        { artist: "The Weeknd", id: "blinding-lights", title: "Blinding Lights" },
        { artist: "Imagine Dragons", id: "believer", title: "Believer" },
      ];
    }

    const normalizedQuery = query.trim().toLowerCase();

    return songs
      .filter((song) =>
        normalizedQuery
          ? getTrackTitle(song.filename).toLowerCase().includes(normalizedQuery)
          : true,
      )
      .slice(0, 8)
      .map((song, index) => ({
        artist: getTrackArtist(index),
        id: song.id,
        title: getTrackTitle(song.filename),
      }));
  }, [query, songs]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 22,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 10,
      }}
    >
      <Text style={{ color: theme.primary, fontSize: 24, fontWeight: "900" }}>
        Search
      </Text>

      <View
        style={[
          {
            alignItems: "center",
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 22,
            borderWidth: 1,
            flexDirection: "row",
            gap: 10,
            minHeight: 52,
            paddingHorizontal: 16,
          },
          softShadow(theme.isDark, "medium"),
        ]}
      >
        <Ionicons name="search" color={theme.secondary} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={theme.secondary}
          style={{ color: theme.primary, flex: 1, fontSize: 13, paddingVertical: 12 }}
        />
        <Ionicons name="mic" color={theme.accent} size={18} />
      </View>

      <View>
        <SectionHeader title="Recent Searches" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {recentSearches.map((item) => (
            <Pressable
              key={item}
              onPress={() => setQuery(item)}
              style={{
                backgroundColor: theme.cardSoft,
                borderColor: theme.border,
                borderRadius: 16,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: theme.primary, fontSize: 11, fontWeight: "800" }}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <SectionHeader title="Popular Genres" />
        <FlatList
          horizontal
          data={genres}
          keyExtractor={(item) => item}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View
              style={{
                alignItems: "center",
                backgroundColor: index % 2 ? "#2CC55E" : theme.accent,
                borderRadius: 16,
                gap: 6,
                height: 76,
                justifyContent: "center",
                paddingHorizontal: 16,
                width: 92,
              }}
            >
              <Ionicons name="musical-notes" color="#FFFFFF" size={18} />
              <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}>
                {item}
              </Text>
            </View>
          )}
        />
      </View>

      <View>
        <SectionHeader title="Top Results" />
        <View style={{ gap: 10 }}>
          {results.map((item, index) => (
            <View
              key={item.id}
              style={[
                {
                  alignItems: "center",
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: 16,
                  borderWidth: 1,
                  flexDirection: "row",
                  gap: 12,
                  padding: 10,
                },
                softShadow(theme.isDark, "low"),
              ]}
            >
              <Artwork size={44} index={index} />
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}
                >
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={{ color: theme.secondary, fontSize: 11 }}>
                  {item.artist}
                </Text>
              </View>
              <Ionicons name="ellipsis-vertical" color={theme.secondary} size={17} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
