import { Ionicons } from "@expo/vector-icons";
import type * as MediaLibrary from "expo-media-library";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

import {
  Artwork,
  SectionHeader,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../components/DesignSystem";
import { useLibraryStore } from "../../store/library.store";
import { usePlayerStore } from "../../store/player.store";

type DisplaySong = {
  artist: string;
  asset?: MediaLibrary.Asset;
  id: string;
  title: string;
};

const fallbackSongs: DisplaySong[] = [
  { artist: "Billie Eilish", id: "ocean-eyes", title: "Ocean Eyes" },
  { artist: "Maroon 5", id: "memories", title: "Memories" },
  { artist: "Imagine Dragons", id: "believer", title: "Believer" },
  { artist: "Post Malone", id: "sunflower", title: "Sunflower" },
  { artist: "Ed Sheeran", id: "shape-of-you", title: "Shape of You" },
  { artist: "Lewis Capaldi", id: "someone-you-loved", title: "Someone You Loved" },
];

function useDisplaySongs() {
  const songs = useLibraryStore((state) => state.songs);

  if (!songs.length) {
    return fallbackSongs;
  }

  return songs.slice(0, 12).map((song, index) => ({
    artist: getTrackArtist(index),
    asset: song,
    id: song.id,
    title: getTrackTitle(song.filename),
  }));
}

function SongTile({
  item,
  index,
  onPress,
}: {
  item: DisplaySong;
  index: number;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} style={{ width: 104 }}>
      <Artwork size={104} index={index} />
      <Text
        numberOfLines={1}
        style={{
          color: theme.primary,
          fontSize: 12,
          fontWeight: "800",
          marginTop: 8,
        }}
      >
        {item.title}
      </Text>
      <Text numberOfLines={1} style={{ color: theme.secondary, fontSize: 10 }}>
        {item.artist}
      </Text>
    </Pressable>
  );
}

function FavoriteStrip({ songs }: { songs: DisplaySong[] }) {
  const theme = useAppTheme();

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {songs.slice(0, 4).map((song, index) => (
        <View
          key={song.id}
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              flex: 1,
              padding: 8,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Artwork size={52} index={index + 5} />
          <Text
            numberOfLines={1}
            style={{
              color: theme.primary,
              fontSize: 11,
              fontWeight: "800",
              marginTop: 6,
              maxWidth: "100%",
            }}
          >
            {song.title}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const displaySongs = useDisplaySongs();
  const scannedSongs = useLibraryStore((state) => state.songs);
  const playSong = usePlayerStore((state) => state.playSong);

  const handlePlay = (item: DisplaySong) => {
    if (!item.asset) {
      return;
    }

    void playSong(item.asset, scannedSongs);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 24,
        paddingBottom: 156,
        paddingHorizontal: 22,
        paddingTop: 8,
      }}
    >
      <View>
        <SectionHeader title="Recently Played" />
        <FlatList
          horizontal
          data={displaySongs.slice(0, 6)}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <SongTile
              item={item}
              index={index}
              onPress={() => handlePlay(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View>
        <SectionHeader title="Most Played" />
        <FlatList
          horizontal
          data={displaySongs.slice(3).concat(displaySongs.slice(0, 3))}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, index }) => (
            <SongTile
              item={item}
              index={index + 3}
              onPress={() => handlePlay(item)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View>
        <SectionHeader title="Favorites" />
        <FavoriteStrip songs={displaySongs} />
      </View>

      <Pressable
        onPress={() => {
          const firstPlayable = displaySongs.find((song) => song.asset);
          if (firstPlayable) {
            handlePlay(firstPlayable);
          }
        }}
        style={[
          {
            alignItems: "center",
            alignSelf: "center",
            backgroundColor: theme.accent,
            borderRadius: 24,
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            marginTop: 2,
            paddingHorizontal: 22,
            paddingVertical: 13,
          },
          softShadow(theme.isDark, "high"),
        ]}
      >
        <Ionicons name="play" color="#FFFFFF" size={16} />
        <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900" }}>
          Play All
        </Text>
      </Pressable>
    </ScrollView>
  );
}
