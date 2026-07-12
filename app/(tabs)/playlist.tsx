import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  Artwork,
  SectionHeader,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";

const playlists = [
  { id: "chill-vibes", songs: 32, title: "Chill Vibes" },
  { id: "workout", songs: 24, title: "Workout" },
  { id: "road-trip", songs: 45, title: "Road Trip" },
  { id: "romantic", songs: 18, title: "Romantic" },
  { id: "focus", songs: 28, title: "Focus" },
  { id: "party-hits", songs: 50, title: "Party Hits" },
];

export default function PlaylistScreen() {
  const theme = useAppTheme();

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
          <SectionHeader title="Made for You" action="Manage" />
        </View>
      }
      renderItem={({ item, index }) => (
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
