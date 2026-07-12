import { Ionicons } from "@expo/vector-icons";
import { FlatList, Text, View } from "react-native";

import { softShadow, useAppTheme } from "../../../components/DesignSystem";
import { useLibraryStore } from "../../../store/library.store";

const sampleFolders = [
  { name: "Downloads", path: "/storage/emulated/0/Download", songs: 18 },
  { name: "Music", path: "/storage/emulated/0/Music", songs: 42 },
  { name: "Recordings", path: "/storage/emulated/0/Recordings", songs: 6 },
];

export default function Folders() {
  const theme = useAppTheme();
  const folders = useLibraryStore((state) => state.folders);
  const data = folders.length
    ? folders.map((folder) => ({
        name: folder.name,
        path: folder.path,
        songs: folder.songs.length,
      }))
    : sampleFolders;

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
            <Text numberOfLines={1} style={{ color: theme.secondary, fontSize: 11 }}>
              {item.path}
            </Text>
          </View>
          <Text style={{ color: theme.secondary, fontSize: 11 }}>
            {item.songs}
          </Text>
        </View>
      )}
    />
  );
}
