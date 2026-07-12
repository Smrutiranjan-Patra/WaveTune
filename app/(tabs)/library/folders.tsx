import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { softShadow, useAppTheme } from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";

export default function Folders() {
  const theme = useAppTheme();
  const folders = useLibraryStore((state) => state.folders);
  const data = folders.map((folder) => ({
    name: folder.name,
    path: folder.path,
    songs: folder.songs.length,
  }));

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.path}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 10,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 14,
      }}
      ListEmptyComponent={
        <Text style={{ color: theme.secondary, fontSize: 13 }}>
          Music folders from your scanned songs will appear here.
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/library-group/[type]",
              params: { key: item.path, title: item.name, type: "folder" },
            })
          }
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              flexDirection: "row",
              gap: 12,
              padding: 12,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <View
            style={{
              alignItems: "center",
              backgroundColor: `${theme.accent}1F`,
              borderRadius: 14,
              height: 46,
              justifyContent: "center",
              width: 46,
            }}
          >
            <Ionicons name="folder-open" color={theme.accent} size={21} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{ color: theme.primary, fontSize: 14, fontWeight: "900" }}
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: theme.secondary, fontSize: 11 }}
            >
              {item.path}
            </Text>
          </View>
          <Text style={{ color: theme.secondary, fontSize: 11 }}>
            {item.songs}
          </Text>
        </Pressable>
      )}
    />
  );
}
