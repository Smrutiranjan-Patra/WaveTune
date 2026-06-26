import React from "react";
import { FlatList, View, Text } from "react-native";

import { useLibraryStore } from "../../../store/library.store";

const Folders = () => {
  const { folders } = useLibraryStore();

  return (
    <FlatList
      data={folders}
      keyExtractor={(item) => item.path}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 15,
            borderBottomWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Text>{item.name}</Text>
          <Text>{item.path}</Text>
          <Text>{item.songs.length} Songs</Text>
        </View>
      )}
    />
  );
};

export default Folders;
