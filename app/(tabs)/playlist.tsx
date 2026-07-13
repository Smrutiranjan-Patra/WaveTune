import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Artwork,
  SectionHeader,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { useLibraryStore } from "../../store/library.store";
import { useUserLibraryStore } from "../../store/user-library.store";

export default function PlaylistScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const songs = useLibraryStore((state) => state.songs);
  const playlists = useUserLibraryStore((state) => state.playlists);
  const favoriteSongIds = useUserLibraryStore((state) => state.favoriteSongIds);
  const cardWidth = (width - 44 - 14) / 2;
  const artworkSize = Math.min(132, cardWidth - 20);
  const playlistItems = [
    {
      id: "favorites",
      isFavorites: true,
      name: "Favorites",
      songIds: favoriteSongIds,
    },
    ...playlists.map((playlist) => ({ ...playlist, isFavorites: false })),
  ];

  return (
    <FlatList
      data={playlistItems}
      keyExtractor={(item) => item.id}
      numColumns={2}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 14,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 10,
      }}
      columnWrapperStyle={{ gap: 14 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 2 }}>
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ color: theme.primary, fontSize: 24, fontWeight: "900" }}
            >
              Playlists
            </Text>
            <Pressable
              onPress={() => router.push("/playlist/new")}
              style={[
                {
                  alignItems: "center",
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: 18,
                  borderWidth: 1,
                  height: 36,
                  justifyContent: "center",
                  width: 36,
                },
                softShadow(theme.isDark, "low"),
              ]}
            >
              <Ionicons name="add" color={theme.accent} size={20} />
            </Pressable>
          </View>
          <SectionHeader title="Your Playlists" action="" />
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingVertical: 36 }}>
          <Ionicons
            name="musical-notes-outline"
            color={theme.accent}
            size={30}
          />
          <Text
            style={{
              color: theme.primary,
              fontSize: 14,
              fontWeight: "900",
              marginTop: 10,
            }}
          >
            No playlists yet
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}>
            Tap the plus button to build your first mix.
          </Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <Pressable
          onPress={() =>
            router.push(
              item.isFavorites
                ? "/collection/favorites"
                : `/playlist/${item.id}`,
            )
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
          <Artwork
            icon={item.isFavorites ? "heart" : "list"}
            size={artworkSize}
            index={item.isFavorites ? 5 : index}
            source={songs.find((song) => song.id === item.songIds[0])}
          />
          <Text
            numberOfLines={1}
            style={{
              color: theme.primary,
              fontSize: 13,
              fontWeight: "900",
              marginTop: 10,
            }}
          >
            {item.name}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 11 }}>
            {item.songIds.length} songs
          </Text>
        </Pressable>
      )}
    />
  );
}
