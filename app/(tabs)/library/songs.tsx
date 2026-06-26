import { FlatList, Text } from "react-native";
import { useLibraryStore } from "../../../store/library.store";

export default function Songs() {
  const { songs } = useLibraryStore();

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.filename}</Text>}
    />
  );
}
