import { FlatList, Text, View } from "react-native";
import React from "react";
import { useLibraryStore } from "../../../store/library.store";

const Album = () => {
  const { albums } = useLibraryStore();

  return (
    <FlatList
      data={albums}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 15,
            borderBottomWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Text>Album ID</Text>
          <Text>{item.id}</Text>
          <Text>Total Songs : {item.songs.length}</Text>
          <Text>First Song : {item.songs[0]?.filename ?? "Unknown"}</Text>
        </View>
      )}
    />
  );
};

export default Album;
