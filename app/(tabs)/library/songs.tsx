import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type * as MediaLibrary from "expo-media-library";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../../../components/DesignSystem";
import { SongListRow } from "../../../components/SongListRow";
import {
  librarySortOptions,
  type LibrarySortOption,
  sortSongsByLibraryOption,
} from "../../../helpers/library/sorting";
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
  const libraryError = useLibraryStore((state) => state.error);
  const lastScanCount = useLibraryStore((state) => state.lastScanCount);
  const loadLibraryData = useLibraryStore((state) => state.loadLibraryData);
  const loading = useLibraryStore((state) => state.loading);
  const songs = useLibraryStore((state) => state.songs);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const playerError = usePlayerStore((state) => state.error);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const pause = usePlayerStore((state) => state.pause);
  const playSong = usePlayerStore((state) => state.playSong);
  const resume = usePlayerStore((state) => state.resume);
  const [sortOption, setSortOption] = useState<LibrarySortOption>("title");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuOpenRef = useRef(false);
  const sortMenuProgress = useRef(new Animated.Value(0)).current;
  const sortedSongs = useMemo(
    () => sortSongsByLibraryOption(songs, sortOption),
    [songs, sortOption],
  );
  const selectedSortLabel =
    librarySortOptions.find((option) => option.value === sortOption)?.label ??
    "Title";
  const hasSongs = sortedSongs.length > 0;

  const setSortMenuVisibility = (visible: boolean) => {
    sortMenuOpenRef.current = visible;
    sortMenuProgress.stopAnimation();
    setSortMenuOpen(visible);
    Animated.timing(sortMenuProgress, {
      duration: visible ? 120 : 100,
      easing: visible ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSortOptionChange = (option: LibrarySortOption) => {
    sortMenuOpenRef.current = false;
    sortMenuProgress.stopAnimation();
    setSortMenuOpen(false);
    Animated.timing(sortMenuProgress, {
      duration: 100,
      easing: Easing.in(Easing.quad),
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSortOption(option);
      }
    });
  };

  const shuffleSongs = (items: MediaLibrary.Asset[]) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [
        shuffled[swapIndex],
        shuffled[index],
      ];
    }

    return shuffled;
  };

  const handlePlayAll = async () => {
    if (!hasSongs) {
      return;
    }

    await playSong(sortedSongs[0], sortedSongs);
  };

  const handleShuffleAll = async () => {
    if (!hasSongs) {
      return;
    }

    const shuffledSongs = shuffleSongs(sortedSongs);
    await playSong(shuffledSongs[0], shuffledSongs);
  };

  const handlePress = async (
    item: MediaLibrary.Asset,
    isCurrentTrack: boolean,
  ) => {
    if (!isCurrentTrack) {
      await playSong(item, sortedSongs);
      return;
    }

    if (isPlaying) {
      await pause();
      return;
    }

    await resume();
  };

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <FlatList
        data={sortedSongs}
        keyExtractor={(item) => item.id}
        style={{ backgroundColor: theme.background, flex: 1 }}
        contentContainerStyle={{
          gap: 10,
          paddingBottom: 154,
          paddingHorizontal: 22,
          paddingTop: 8,
        }}
        ListHeaderComponent={
          <View
            style={{
              gap: 12,
              paddingBottom: 4,
              position: "relative",
              zIndex: 10,
            }}
          >
            {songs.length ? (
              <>
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "transparent",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    minHeight: 44,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Pressable
                      accessibilityLabel={`Sort songs by ${selectedSortLabel}`}
                      accessibilityRole="button"
                      android_ripple={{ color: `${theme.accent}1A` }}
                      onPress={() =>
                        setSortMenuVisibility(!sortMenuOpenRef.current)
                      }
                      style={[
                        {
                          alignItems: "center",
                          alignSelf: "flex-start",
                          backgroundColor: sortMenuOpen
                            ? theme.cardSoft
                            : theme.card,
                          borderColor: sortMenuOpen
                            ? `${theme.accent}66`
                            : theme.border,
                          borderRadius: 17,
                          borderWidth: 1,
                          flexDirection: "row",
                          gap: 9,
                          maxWidth: "100%",
                          minHeight: 40,
                          overflow: "hidden",
                          paddingHorizontal: 14,
                        },
                        softShadow(theme.isDark, "low"),
                      ]}
                    >
                      <Ionicons
                        color={sortMenuOpen ? theme.accent : theme.secondary}
                        name="filter"
                        size={22}
                      />
                      <Text
                        numberOfLines={1}
                        style={{
                          color: sortMenuOpen ? theme.accent : theme.primary,
                          flexShrink: 1,
                          fontSize: 15,
                          fontWeight: "900",
                        }}
                      >
                        {selectedSortLabel}
                      </Text>
                      <Animated.View
                        style={{
                          transform: [
                            {
                              rotate: sortMenuProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0deg", "180deg"],
                              }),
                            },
                          ],
                        }}
                      >
                        <Ionicons
                          color={sortMenuOpen ? theme.accent : theme.secondary}
                          name="chevron-down"
                          size={16}
                        />
                      </Animated.View>
                    </Pressable>
                  </View>
                  <View
                    style={{
                      alignItems: "center",
                      alignSelf: "center",
                      flexDirection: "row",
                      gap: 12,
                      height: 40,
                      justifyContent: "center",
                    }}
                  >
                    <Pressable
                      accessibilityLabel="Play all songs"
                      accessibilityRole="button"
                      android_ripple={{
                        borderless: true,
                        color: "#FFFFFF2E",
                      }}
                      onPress={() => {
                        void handlePlayAll();
                      }}
                      style={[
                        {
                          alignItems: "center",
                          backgroundColor: theme.accent,
                          borderRadius: 20,
                          height: 40,
                          justifyContent: "center",
                          overflow: "hidden",
                          width: 40,
                        },
                        softShadow(theme.isDark, "medium"),
                      ]}
                    >
                      <Ionicons color="#FFFFFF" name="play" size={20} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Shuffle songs"
                      accessibilityRole="button"
                      android_ripple={{
                        borderless: true,
                        color: `${theme.accent}1F`,
                      }}
                      onPress={() => {
                        void handleShuffleAll();
                      }}
                      style={[
                        {
                          alignItems: "center",
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                          borderRadius: 20,
                          borderWidth: 1,
                          height: 40,
                          justifyContent: "center",
                          overflow: "hidden",
                          width: 40,
                        },
                        softShadow(theme.isDark, "low"),
                      ]}
                    >
                      <Ionicons
                        color={theme.primary}
                        name="shuffle"
                        size={22}
                      />
                    </Pressable>
                  </View>
                </View>
              </>
            ) : null}
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
            {!sortedSongs.length ? (
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
              artworkSource={item}
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
      <Animated.View
        accessibilityElementsHidden={!sortMenuOpen}
        importantForAccessibility={sortMenuOpen ? "yes" : "no-hide-descendants"}
        pointerEvents={sortMenuOpen ? "auto" : "none"}
        style={[
          softShadow(theme.isDark, "high"),
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: 16,
            borderWidth: 1,
            elevation: 30,
            left: 22,
            opacity: sortMenuProgress,
            overflow: "hidden",
            paddingHorizontal: 10,
            paddingVertical: 10,
            position: "absolute",
            top: 60,
            transform: [
              {
                translateY: sortMenuProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-4, 0],
                }),
              },
            ],
            width: 120,
            zIndex: 30,
          },
        ]}
      >
        {librarySortOptions.map((option, index) => {
          const selected = sortOption === option.value;
          const isLast = index === librarySortOptions.length - 1;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              android_ripple={{ color: `${theme.accent}1A` }}
              key={option.value}
              onPress={() => {
                handleSortOptionChange(option.value);
              }}
              style={{
                alignItems: "center",
                backgroundColor: selected ? `${theme.accent}14` : theme.card,
                borderBottomColor: theme.border,
                borderBottomWidth: isLast ? 0 : 1,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                minHeight: 42,
                paddingHorizontal: 14,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: selected ? theme.accent : theme.primary,
                  flex: 1,
                  fontSize: 13,
                  fontWeight: selected ? "900" : "700",
                }}
              >
                {option.label}
              </Text>
              {selected ? (
                <Ionicons
                  color={theme.accent}
                  name="checkmark-circle"
                  size={17}
                />
              ) : null}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}
