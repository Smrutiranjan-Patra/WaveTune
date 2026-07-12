import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";

import { Artwork, softShadow, useAppTheme } from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";

export default function Artists() {
  const theme = useAppTheme();
  const artists = useLibraryStore((state) => state.artists);
  const data = artists.map((artist, index) => ({
    name: artist.name,
    songs: artist.songs.length,
    index,
  }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.name}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 10,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 14,
      }}
      ListEmptyComponent={
        <Text style={{ color: theme.secondary, fontSize: 13 }}>
          Artists from your music library will appear here.
        </Text>
      }
      renderItem={({ item }) => (
        <View
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
          <Artwork icon="person" size={48} index={item.index} />
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{ color: theme.primary, fontSize: 14, fontWeight: "900" }}
            >
              {item.name}
            </Text>
            <Text style={{ color: theme.secondary, fontSize: 11 }}>
              {item.songs} songs
            </Text>
          </View>
          <Ionicons name="chevron-forward" color={theme.secondary} size={18} />
        </View>
      )}
    />
  );
}
