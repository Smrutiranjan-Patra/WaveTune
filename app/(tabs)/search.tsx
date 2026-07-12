import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, ScrollView, Text, TextInput, View } from "react-native";

import {
  Artwork,
  SectionHeader,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { useLibraryStore } from "../../store/library.store";

export default function SearchScreen() {
  const theme = useAppTheme();
  const [query, setQuery] = useState("");
  const genres = useLibraryStore((state) => state.genres);
  const songs = useLibraryStore((state) => state.songs);

  const results = useMemo(() => {
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

  const recentSearches = songs.slice(0, 4).map((song) => getTrackTitle(song.filename));
  const visibleGenres = genres.filter((genre) => genre.songs.length > 0);

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

      {recentSearches.length ? (
        <View>
          <SectionHeader title="Recent Searches" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {recentSearches.map((item) => (
              <Text
                key={item}
                onPress={() => setQuery(item)}
                style={{
                  backgroundColor: theme.cardSoft,
                  borderColor: theme.border,
                  borderRadius: 16,
                  borderWidth: 1,
                  color: theme.primary,
                  fontSize: 11,
                  fontWeight: "800",
                  overflow: "hidden",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                {item}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {visibleGenres.length ? (
        <View>
          <SectionHeader title="Popular Genres" />
          <FlatList
            horizontal
            data={visibleGenres}
            keyExtractor={(item) => item.name}
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
                  {item.name}
                </Text>
              </View>
            )}
          />
        </View>
      ) : null}

      <View>
        <SectionHeader title="Top Results" />
        {results.length ? (
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
                  <Text
                    numberOfLines={1}
                    style={{ color: theme.secondary, fontSize: 11 }}
                  >
                    {item.artist}
                  </Text>
                </View>
                <Ionicons name="ellipsis-vertical" color={theme.secondary} size={17} />
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderRadius: 16,
                borderWidth: 1,
                padding: 16,
              },
              softShadow(theme.isDark, "low"),
            ]}
          >
            <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}>
              {songs.length ? "No matching songs" : "No songs found"}
            </Text>
            <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}>
              {songs.length
                ? "Try another search term."
                : "Your scanned music library will appear here."}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
