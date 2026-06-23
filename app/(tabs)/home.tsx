import SongCard from "@/components/SongCard";
import { FlatList, ScrollView, Text, View } from "react-native";
import Button from "../../components/Button";

const HomeScreen = () => {
  return (
    <ScrollView className="bg-background" showsVerticalScrollIndicator={false}>
      {/* recently played */}
      <View>
        <View className="px-4 py-3 bg-white flex-row items-center justify-between">
          <Text className="text-l tracking-wide text-textPrimary">
            Recently Played
          </Text>
          <Button title="See all" onPress={() => {}} />
        </View>
        <FlatList
          data={[
            { id: "1", songTitle: "Title 1", songArtist: "Artist 1" },
            { id: "2", songTitle: "Title 2", songArtist: "Artist 2" },
            { id: "3", songTitle: "Title 3", songArtist: "Artist 3" },
            { id: "4", songTitle: "Title 4", songArtist: "Artist 4" },
            { id: "5", songTitle: "Title 5", songArtist: "Artist 5" },
            { id: "6", songTitle: "Title 6", songArtist: "Artist 6" },
            { id: "7", songTitle: "Title 7", songArtist: "Artist 7" },
            { id: "8", songTitle: "Title 8", songArtist: "Artist 8" },
            { id: "9", songTitle: "Title 9", songArtist: "Artist 9" },
          ]}
          renderItem={({ item }) => (
            <SongCard songTitle={item.songTitle} songArtist={item.songArtist} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            backgroundColor: "white",
          }}
          ItemSeparatorComponent={() => <View className="w-10" />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* most played */}
      <View>
        <View className="px-4 py-3 bg-white flex-row items-center justify-between">
          <Text className="text-l tracking-wide text-textPrimary">
            Most Played
          </Text>
          <Button title="See all" onPress={() => {}} />
        </View>
        <FlatList
          data={[
            { id: "1", songTitle: "Title 1", songArtist: "Artist 1" },
            { id: "2", songTitle: "Title 2", songArtist: "Artist 2" },
            { id: "3", songTitle: "Title 3", songArtist: "Artist 3" },
            { id: "4", songTitle: "Title 4", songArtist: "Artist 4" },
            { id: "5", songTitle: "Title 5", songArtist: "Artist 5" },
            { id: "6", songTitle: "Title 6", songArtist: "Artist 6" },
            { id: "7", songTitle: "Title 7", songArtist: "Artist 7" },
            { id: "8", songTitle: "Title 8", songArtist: "Artist 8" },
            { id: "9", songTitle: "Title 9", songArtist: "Artist 9" },
          ]}
          renderItem={({ item }) => (
            <SongCard songTitle={item.songTitle} songArtist={item.songArtist} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            backgroundColor: "white",
          }}
          ItemSeparatorComponent={() => <View className="w-10" />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* favorite */}
      <View>
        <View className="px-4 py-3 bg-white flex-row items-center justify-between">
          <Text className="text-l tracking-wide text-textPrimary">
            Favorite
          </Text>
          <Button title="See all" onPress={() => {}} />
        </View>

        <FlatList
          data={[
            { id: "1", songTitle: "Title 1", songArtist: "Artist 1" },
            { id: "2", songTitle: "Title 2", songArtist: "Artist 2" },
            { id: "3", songTitle: "Title 3", songArtist: "Artist 3" },
            { id: "4", songTitle: "Title 4", songArtist: "Artist 4" },
            { id: "5", songTitle: "Title 5", songArtist: "Artist 5" },
            { id: "6", songTitle: "Title 6", songArtist: "Artist 6" },
            { id: "7", songTitle: "Title 7", songArtist: "Artist 7" },
            { id: "8", songTitle: "Title 8", songArtist: "Artist 8" },
            { id: "9", songTitle: "Title 9", songArtist: "Artist 9" },
          ]}
          renderItem={({ item }) => (
            <SongCard songTitle={item.songTitle} songArtist={item.songArtist} />
          )}
          contentContainerStyle={{
            paddingHorizontal: 16,
            backgroundColor: "white",
          }}
          ItemSeparatorComponent={() => <View className="w-10" />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
