import { router } from "expo-router";
import { FlatList, Pressable, Text, useWindowDimensions } from "react-native";

import {
  Artwork,
  softShadow,
  useAppTheme,
} from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";

export default function Albums() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const albums = useLibraryStore((state) => state.albums);
  const cardWidth = (width - 44 - 14) / 2;
  const artworkSize = Math.min(128, cardWidth - 20);
  const data = albums.map((album, index) => ({
    id: album.id,
    songs: album.songs.length,
    title: album.name,
    index,
  }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={2}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 14,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 14,
      }}
      columnWrapperStyle={{ gap: 14 }}
      ListEmptyComponent={
        <Text style={{ color: theme.secondary, fontSize: 13 }}>
          Albums from your music library will appear here.
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/library-group/[type]",
              params: { key: item.id, title: item.title, type: "album" },
            })
          }
          style={[
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              padding: 10,
              width: cardWidth,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Artwork size={artworkSize} index={item.index} />
          <Text
            numberOfLines={1}
            style={{
              color: theme.primary,
              fontSize: 13,
              fontWeight: "900",
              marginTop: 10,
            }}
          >
            {item.title}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 11 }}>
            {item.songs} songs
          </Text>
        </Pressable>
      )}
    />
  );
}
