import { FlatList, Text, View } from "react-native";

import {
  Artwork,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";

const sampleAlbums = [
  { id: "chill-vibes", songs: 32, title: "Chill Vibes" },
  { id: "workout", songs: 24, title: "Workout" },
  { id: "road-trip", songs: 45, title: "Road Trip" },
  { id: "romantic", songs: 18, title: "Romantic" },
];

export default function Albums() {
  const theme = useAppTheme();
  const albums = useLibraryStore((state) => state.albums);
  const data = albums.length
    ? albums.map((album, index) => ({
        id: album.id,
        songs: album.songs.length,
        title: getTrackTitle(album.songs[0]?.filename ?? album.id),
        index,
      }))
    : sampleAlbums.map((album, index) => ({ ...album, index }));

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
