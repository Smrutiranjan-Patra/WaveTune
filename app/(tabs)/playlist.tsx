import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  Artwork,
  SectionHeader,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { useUserLibraryStore } from "../../store/user-library.store";

export default function PlaylistScreen() {
  const theme = useAppTheme();
  const playlists = useUserLibraryStore((state) => state.playlists);

  return (
    <FlatList
      data={playlists}
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
            <Text style={{ color: theme.primary, fontSize: 24, fontWeight: "900" }}>
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
          <SectionHeader title="Your Playlists" />
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingVertical: 36 }}>
          <Ionicons name="musical-notes-outline" color={theme.accent} size={30} />
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: "900", marginTop: 10 }}>
            No playlists yet
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}>
            Tap the plus button to build your first mix.
          </Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <Pressable
          onPress={() => router.push(`/playlist/${item.id}`)}
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
          <Artwork size={132} index={index} />
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
