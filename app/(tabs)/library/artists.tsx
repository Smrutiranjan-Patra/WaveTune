import React from "react";
import { FlatList, View, Text } from "react-native";

import { useLibraryStore } from "../../../store/library.store";

const Artists = () => {
  const { artists } = useLibraryStore();

  return (
    <FlatList
      key="artists-list"
      data={artists}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 15,
            borderBottomWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Text>{item.name}</Text>
          <Text>{item.songs.length} Songs</Text>
        </View>
      )}
    />
  );
};

export default Artists;
