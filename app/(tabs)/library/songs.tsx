import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type * as MediaLibrary from "expo-media-library";
import { FlatList, Pressable, Text, View } from "react-native";

import {
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../../components/DesignSystem";
import { SongListRow } from "../../../components/SongListRow";
import { useLibraryStore } from "../../../store/library.store";
import { usePlayerStore } from "../../../store/player.store";

function EmptyLibrary({
  error,
  lastScanCount,
  loading,
  onRescan,
}: {
  error: string | null;
  lastScanCount: number;
  loading: boolean;
  onRescan: () => void;
}) {
  const theme = useAppTheme();
  const title = loading
    ? "Scanning your songs..."
    : error
      ? "Library scan failed"
      : "No songs found";
  const message = loading
    ? "Your device music library is loading."
    : error
      ? error
      : lastScanCount === 0
        ? "WaveTune scanned your audio library but did not find any songs."
        : "Add audio files to your device or rescan from Settings.";

  return (
    <View
      style={[
        {
          alignItems: "center",
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderRadius: 16,
          borderWidth: 1,
          gap: 8,
          padding: 18,
        },
        softShadow(theme.isDark, "low"),
      ]}
    >
      <Ionicons name="musical-notes-outline" color={theme.accent} size={26} />
      <Text
        style={{
          color: theme.primary,
          fontSize: 14,
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{ color: theme.secondary, fontSize: 12, textAlign: "center" }}
      >
        {message}
      </Text>
      {!loading ? (
        <Pressable
          onPress={onRescan}
          style={{
            backgroundColor: theme.accent,
            borderRadius: 18,
            marginTop: 4,
            paddingHorizontal: 16,
            paddingVertical: 9,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}>
            Rescan Library
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Songs() {
  const theme = useAppTheme();
  const {
    error: libraryError,
    lastScanCount,
    loadLibraryData,
    loading,
    songs,
  } = useLibraryStore();
  const {
    currentTrack,
    error: playerError,
    isPlaying,
    pause,
    playSong,
    resume,
  } = usePlayerStore();

  const handlePress = async (
    item: MediaLibrary.Asset,
    isCurrentTrack: boolean,
  ) => {
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
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 10,
        paddingBottom: 154,
        paddingHorizontal: 22,
        paddingTop: 8,
      }}
      ListHeaderComponent={
        <View style={{ gap: 12, paddingBottom: 4 }}>
          {playerError ? (
            <View
              style={{
                backgroundColor: theme.isDark ? "#3A1820" : "#FFF1F2",
                borderColor: theme.isDark ? "#7F1D2D" : "#FDA4AF",
                borderRadius: 14,
                borderWidth: 1,
                padding: 12,
              }}
            >
              <Text style={{ color: theme.isDark ? "#FDA4AF" : "#9F1239" }}>
                {playerError}
              </Text>
            </View>
          ) : null}
          {!songs.length ? (
            <EmptyLibrary
              error={libraryError}
              lastScanCount={lastScanCount}
              loading={loading}
              onRescan={() => {
                void loadLibraryData();
              }}
            />
          ) : null}
        </View>
      }
      renderItem={({ item, index }) => {
        const isCurrentTrack = currentTrack?.id === item.id;

        return (
          <SongListRow
            artist={getTrackArtist(item)}
            duration={item.duration}
            index={index}
            isCurrentTrack={isCurrentTrack}
            isPlaying={isPlaying}
            onPress={() => {
              void handlePress(item, isCurrentTrack);
            }}
            onDetailPress={() => router.push(`/song/${item.id}`)}
            title={getTrackTitle(item)}
          />
        );
      }}
    />
  );
}
