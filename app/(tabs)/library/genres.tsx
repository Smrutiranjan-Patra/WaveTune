import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { softShadow, useAppTheme } from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";

export default function Genres() {
  const theme = useAppTheme();
  const genres = useLibraryStore((state) => state.genres);
  const data = genres.map((genre) => ({
    name: genre.name,
    songs: genre.songs.length,
  }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.name}
      numColumns={2}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 12,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 14,
      }}
      columnWrapperStyle={{ gap: 12 }}
      ListEmptyComponent={
        <Text style={{ color: theme.secondary, fontSize: 13 }}>
          Genres from your music library will appear here.
        </Text>
      }
      renderItem={({ item, index }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/library-group/[type]",
              params: { key: item.name, title: item.name, type: "genre" },
            })
          }
          style={[
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              flex: 1,
              minHeight: 92,
              padding: 14,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor: `${theme.accent}${index % 2 ? "1F" : "2B"}`,
              borderRadius: 16,
              height: 34,
              justifyContent: "center",
              width: 34,
            }}
          >
            <Ionicons name="radio" color={theme.accent} size={17} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: theme.primary,
              fontSize: 14,
              fontWeight: "900",
              marginTop: 12,
            }}
          >
            {item.name}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 11 }}>
            {item.songs} songs
          </Text>
        </Pressable>
      )}
    />
  );
}
