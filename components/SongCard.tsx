import React from "react";
import { Image, Text, View } from "react-native";

type SongCardProps = {
  songTitle: string;
  songArtist: string;
};

const SongCard = ({ songTitle, songArtist }: SongCardProps) => {
  return (
    <View className="bg-white rounded-lg flex-1 justify-center w-30 h-30">
      <Image
        source={{ uri: "https://picsum.photos/200" }}
        className="w-24 h-24 rounded-lg"
      />
      <View className="py-2">
        <Text className="text-s p-0 font-bold text-textPrimary">
          {songTitle}
        </Text>
        <Text className="text-xs p-0 text-gray-500 text-textSecondary">
          {songArtist}
        </Text>
      </View>
    </View>
  );
};

export default SongCard;
