import { FlatList, Pressable, Text, View } from "react-native";
import { useLibraryStore } from "../../../store/library.store";
import { usePlayerStore } from "../../../store/player.store";

export default function Songs() {
  const { songs } = useLibraryStore();
  const { currentTrack, error, isPlaying, playSong, pause, resume } = usePlayerStore();

  const handlePress = async (item, isCurrentTrack) => {
    if (!isCurrentTrack) {
      await playSong(item, songs);
      return;
    }

    if (isPlaying) {
      await pause();
      return;
    }

    await resume();
  };

  return (
    <FlatList
      data={songs}
      ListHeaderComponent={
        error ? (
          <View
            style={{
              margin: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#FEF2F2",
              borderWidth: 1,
              borderColor: "#FCA5A5",
            }}
          >
            <Text style={{ color: "#991B1B", fontSize: 13 }}>{error}</Text>
          </View>
        ) : null
      }
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isCurrentTrack = currentTrack?.id === item.id;
        return (
          <Pressable
            onPress={() => {
              void handlePress(item, isCurrentTrack);
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: isCurrentTrack ? "#EEF2FF" : "#FFFFFF",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
                  {item.filename}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}
