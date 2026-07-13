import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type * as MediaLibrary from "expo-media-library";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

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
import { useSettingsStore } from "../../store/settings.store";
import { useUserLibraryStore } from "../../store/user-library.store";

type DisplaySong = {
  artist: string;
  asset?: MediaLibrary.Asset;
  id: string;
  title: string;
};

function toDisplaySongs(songs: MediaLibrary.Asset[]) {
  return songs.map((song) => ({
    artist: getTrackArtist(song),
    asset: song,
    id: song.id,
    title: getTrackTitle(song),
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
      <Artwork size={104} index={index} source={item.asset} />
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

function FavoriteStrip({
  onPress,
  songs,
}: {
  onPress: (song: DisplaySong) => void;
  songs: DisplaySong[];
}) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - 44 - 30) / 4;
  const artworkSize = Math.min(52, cardWidth - 16);

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {songs.slice(0, 4).map((song, index) => (
        <Pressable
          accessibilityRole="button"
          key={song.id}
          onPress={() => onPress(song)}
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 16,
              borderWidth: 1,
              padding: 8,
              width: cardWidth,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <Artwork size={artworkSize} index={index + 5} source={song.asset} />
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
        </Pressable>
      ))}
    </View>
  );
}

function EmptySection({ title }: { title: string }) {
  const theme = useAppTheme();

  return (
    <View>
      <SectionHeader title={title} action="" />
      <View
        style={[
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 16,
            borderWidth: 1,
            padding: 16,
          },
          softShadow(theme.isDark, "low"),
        ]}
      >
        <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}>
          Your music will appear here
        </Text>
        <Text style={{ color: theme.secondary, fontSize: 12, marginTop: 4 }}>
          Add songs to your device or rescan the library from Settings.
        </Text>
      </View>
    </View>
  );
}

function EmptyFeatureCard({
  icon,
  message,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  title: string;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderRadius: 16,
          borderWidth: 1,
          flex: 1,
          minHeight: 116,
          padding: 14,
        },
        softShadow(theme.isDark, "low"),
      ]}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: `${theme.accent}18`,
          borderRadius: 16,
          height: 34,
          justifyContent: "center",
          marginBottom: 12,
          width: 34,
        }}
      >
        <Ionicons name={icon} color={theme.accent} size={18} />
      </View>
      <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}>
        {title}
      </Text>
      <Text
        style={{
          color: theme.secondary,
          fontSize: 11,
          lineHeight: 15,
          marginTop: 4,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

function FirstRunHome({
  onPlayAll,
  songsCount,
  userName,
}: {
  onPlayAll: () => void;
  songsCount: number;
  userName: string | null;
}) {
  const theme = useAppTheme();

  return (
    <View style={{ gap: 20 }}>
      <View
        style={[
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 24,
            borderWidth: 1,
            overflow: "hidden",
            padding: 18,
          },
          softShadow(theme.isDark, "medium"),
        ]}
      >
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Artwork icon="radio" index={2} size={92} />
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
              style={{
                color: theme.primary,
                fontSize: 20,
                fontWeight: "900",
                lineHeight: 25,
              }}
            >
              {userName ? `Ready, ${userName}?` : "Your home is ready"}
            </Text>
            <Text
              style={{
                color: theme.secondary,
                fontSize: 12,
                lineHeight: 18,
                marginTop: 6,
              }}
            >
              {songsCount
                ? `${songsCount} songs are ready. Play a few tracks and WaveTune will shape this space around you.`
                : "Once your library has songs, recent plays, most played tracks, and favorites will settle in here."}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          {songsCount ? (
            <Pressable
              onPress={onPlayAll}
              style={[
                {
                  alignItems: "center",
                  backgroundColor: theme.accent,
                  borderRadius: 20,
                  flex: 1,
                  flexDirection: "row",
                  gap: 7,
                  justifyContent: "center",
                  minHeight: 42,
                },
                softShadow(theme.isDark, "high"),
              ]}
            >
              <Ionicons name="play" color="#FFFFFF" size={15} />
              <Text
                style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}
              >
                Play All
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() =>
              router.push(
                songsCount ? "/(tabs)/library/songs" : "/(tabs)/settings",
              )
            }
            style={[
              {
                alignItems: "center",
                backgroundColor: theme.cardSoft,
                borderColor: theme.border,
                borderRadius: 20,
                borderWidth: 1,
                flex: 1,
                flexDirection: "row",
                gap: 7,
                justifyContent: "center",
                minHeight: 42,
              },
              softShadow(theme.isDark, "low"),
            ]}
          >
            <Ionicons
              name={songsCount ? "musical-notes-outline" : "refresh-outline"}
              color={theme.accent}
              size={15}
            />
            <Text
              style={{ color: theme.primary, fontSize: 12, fontWeight: "900" }}
            >
              {songsCount ? "Library" : "Rescan"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View>
        <SectionHeader title="Coming Up" action="" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <EmptyFeatureCard
            icon="time-outline"
            title="Recently Played"
            message="Tracks appear here after your first listen."
          />
          <EmptyFeatureCard
            icon="flame-outline"
            title="Most Played"
            message="Your repeat favorites rise here over time."
          />
        </View>
      </View>

      <View
        style={[
          {
            alignItems: "center",
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 18,
            borderWidth: 1,
            flexDirection: "row",
            gap: 12,
            padding: 14,
          },
          softShadow(theme.isDark, "low"),
        ]}
      >
        <View
          style={{
            alignItems: "center",
            backgroundColor: `${theme.accent}18`,
            borderRadius: 18,
            height: 42,
            justifyContent: "center",
            width: 42,
          }}
        >
          <Ionicons name="heart-outline" color={theme.accent} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: theme.primary, fontSize: 13, fontWeight: "900" }}
          >
            Favorites are waiting
          </Text>
          <Text
            style={{
              color: theme.secondary,
              fontSize: 11,
              lineHeight: 16,
              marginTop: 3,
            }}
          >
            Tap the heart on a song or player screen to save it here.
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const scannedSongs = useLibraryStore((state) => state.songs);
  const userName = useSettingsStore((state) => state.userName);
  const favoriteSongIds = useUserLibraryStore((state) => state.favoriteSongIds);
  const history = useUserLibraryStore((state) => state.history);
  const playSong = usePlayerStore((state) => state.playSong);
  const songsById = new Map(scannedSongs.map((song) => [song.id, song]));
  const recentSongs = toDisplaySongs(
    history
      .map((entry) => songsById.get(entry.songId))
      .filter(Boolean) as MediaLibrary.Asset[],
  );
  const mostPlayedSongs = toDisplaySongs(
    [...history]
      .sort((a, b) => b.playCount - a.playCount)
      .map((entry) => songsById.get(entry.songId))
      .filter(Boolean) as MediaLibrary.Asset[],
  );
  const favoriteSongs = toDisplaySongs(
    favoriteSongIds
      .map((id) => songsById.get(id))
      .filter(Boolean) as MediaLibrary.Asset[],
  );

  const handlePlay = (item: DisplaySong) => {
    if (!item.asset) {
      return;
    }

    void playSong(item.asset, scannedSongs);
  };

  const handlePlayAll = () => {
    const firstPlayable = toDisplaySongs(scannedSongs).find(
      (song) => song.asset,
    );

    if (firstPlayable) {
      handlePlay(firstPlayable);
    }
  };

  const hasNoPersonalizedData =
    recentSongs.length === 0 &&
    mostPlayedSongs.length === 0 &&
    favoriteSongs.length === 0;

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
      {hasNoPersonalizedData ? (
        <FirstRunHome
          onPlayAll={handlePlayAll}
          songsCount={scannedSongs.length}
          userName={userName}
        />
      ) : (
        <>
          {recentSongs.length ? (
            <View>
              <SectionHeader
                title="Recently Played"
                onActionPress={() => router.push("/collection/recent")}
              />
              <FlatList
                horizontal
                data={recentSongs.slice(0, 6)}
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
          ) : (
            <EmptySection title="Recently Played" />
          )}

          {mostPlayedSongs.length ? (
            <View>
              <SectionHeader
                title="Most Played"
                onActionPress={() => router.push("/collection/most-played")}
              />
              <FlatList
                horizontal
                data={mostPlayedSongs.slice(0, 12)}
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
          ) : null}

          {favoriteSongs.length ? (
            <View>
              <SectionHeader
                title="Favorites"
                onActionPress={() => router.push("/collection/favorites")}
              />
              <FavoriteStrip songs={favoriteSongs} onPress={handlePlay} />
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
