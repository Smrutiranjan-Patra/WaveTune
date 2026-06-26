import React from "react";
import {FlatList, View, Text } from "react-native";

import { useLibraryStore } from "../../../store/library.store";

const Genres = () => {
  const { genres } = useLibraryStore();

  return (
    <FlatList
      data={genres}
      keyExtractor={(item) => item.name}
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

export default Genres;
