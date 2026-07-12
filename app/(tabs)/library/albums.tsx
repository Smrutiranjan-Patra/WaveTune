import { FlatList, Text, View } from "react-native";

import {
  Artwork,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";

export default function Albums() {
  const theme = useAppTheme();
  const albums = useLibraryStore((state) => state.albums);
  const data = albums.map((album, index) => ({
    id: album.id,
    songs: album.songs.length,
    title: getTrackTitle(album.songs[0]?.filename ?? album.id),
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
        <View
          style={[
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              flex: 1,
              padding: 10,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Artwork size={128} index={item.index} />
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
        </View>
      )}
    />
  );
}
