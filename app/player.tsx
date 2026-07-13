import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type * as MediaLibrary from "expo-media-library";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  PanResponder,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { useShallow } from "zustand/react/shallow";

import {
  Artwork,
  formatTime,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../components/DesignSystem";
import { SongListRow } from "../components/SongListRow";
import {
  type AudioOutputRoute,
  getAudioOutputRoutes,
  selectAudioOutputRoute,
} from "../services/player/audio-route.service";
import { usePlayerStore } from "../store/player.store";
import {
  type EqualizerPreset,
  useSettingsStore,
} from "../store/settings.store";
import { useUserLibraryStore } from "../store/user-library.store";
import type { MusicAsset } from "../types/music";
import { UNKNOWN_ALBUM } from "../types/music";

type IconName = ComponentProps<typeof Ionicons>["name"];

function RoundButton({
  active = false,
  badge,
  disabled,
  icon,
  onPress,
  prominent = false,
}: {
  active?: boolean;
  badge?: string;
  disabled?: boolean;
  icon: IconName;
  onPress: () => void;
  prominent?: boolean;
}) {
  const theme = useAppTheme();
  const size = prominent ? 76 : 46;
  const emphasized = prominent || active;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          alignItems: "center",
          backgroundColor: emphasized ? theme.accent : theme.card,
          borderColor: emphasized ? theme.accent : theme.border,
          borderRadius: size / 2,
          borderWidth: 1,
          height: size,
          justifyContent: "center",
          opacity: disabled ? 0.35 : 1,
          width: size,
        },
        softShadow(theme.isDark, prominent ? "high" : "low"),
      ]}
    >
      <Ionicons
        name={icon}
        color={emphasized ? "#FFFFFF" : theme.icon}
        size={prominent ? 34 : 22}
      />
      {badge ? (
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 9,
            fontWeight: "900",
            position: "absolute",
            right: 8,
            top: 7,
          }}
        >
          {badge}
        </Text>
      ) : null}
    </Pressable>
  );
}

function UtilityButton({
  active = false,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        flex: 1,
        gap: 2,
        justifyContent: "center",
        minHeight: 52,
        minWidth: 0,
        opacity: pressed ? 0.55 : 1,
      })}
    >
      <View
        style={{
          alignItems: "center",
          height: 24,
          justifyContent: "center",
          width: 28,
        }}
      >
        <Ionicons
          name={icon}
          color={active ? theme.accent : theme.secondary}
          size={20}
        />
      </View>
      <Text
        numberOfLines={1}
        style={{
          color: active ? theme.accent : theme.secondary,
          fontSize: 9,
          fontWeight: "800",
          lineHeight: 14,
          textAlign: "center",
          width: "100%",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PlayerProgress() {
  const theme = useAppTheme();
  const { duration, position, seekTo } = usePlayerStore(
    useShallow((state) => ({
      duration: state.duration,
      position: state.position,
      seekTo: state.seekTo,
    })),
  );
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const durationRef = useRef(duration);
  const progressBarWidth = useRef(0);
  const seekToRef = useRef(seekTo);

  durationRef.current = duration;
  seekToRef.current = seekTo;

  const getSeekPosition = (locationX: number) => {
    if (!durationRef.current || progressBarWidth.current <= 0) {
      return 0;
    }

    const clampedX = Math.min(Math.max(locationX, 0), progressBarWidth.current);
    return (clampedX / progressBarWidth.current) * durationRef.current;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => durationRef.current > 0,
      onPanResponderGrant: (event) => {
        const nextPosition = getSeekPosition(event.nativeEvent.locationX);
        setIsScrubbing(true);
        setScrubPosition(nextPosition);
      },
      onPanResponderMove: (event) => {
        setScrubPosition(getSeekPosition(event.nativeEvent.locationX));
      },
      onPanResponderRelease: (event) => {
        const nextPosition = getSeekPosition(event.nativeEvent.locationX);
        setIsScrubbing(false);
        setScrubPosition(nextPosition);
        void seekToRef.current(nextPosition);
      },
      onPanResponderTerminate: () => {
        setIsScrubbing(false);
      },
      onStartShouldSetPanResponder: () => durationRef.current > 0,
    }),
  ).current;

  const visiblePosition = isScrubbing ? scrubPosition : position;
  const progress = duration > 0 ? Math.min(visiblePosition / duration, 1) : 0;

  return (
    <View style={{ width: "100%" }}>
      <View
        onLayout={(event) => {
          progressBarWidth.current = event.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
        style={{ height: 30, justifyContent: "center" }}
      >
        <View
          style={{
            backgroundColor: theme.track,
            borderRadius: 999,
            height: 7,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              backgroundColor: theme.accent,
              height: "100%",
              width: `${progress * 100}%`,
            }}
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            backgroundColor: theme.accent,
            borderColor: theme.card,
            borderRadius: 9,
            borderWidth: 3,
            height: 18,
            left: `${progress * 100}%`,
            marginLeft: -9,
            position: "absolute",
            width: 18,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 6,
        }}
      >
        <Text style={{ color: theme.secondary, fontSize: 11 }}>
          {formatTime(visiblePosition)}
        </Text>
        <Text style={{ color: theme.secondary, fontSize: 11 }}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

function VolumeSlider({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  const theme = useAppTheme();
  const widthRef = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const updateVolume = (locationX: number) => {
    if (widthRef.current <= 0) return;
    onChangeRef.current(
      Math.min(Math.max(locationX / widthRef.current, 0), 1),
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        updateVolume(event.nativeEvent.locationX);
      },
      onPanResponderMove: (event) => {
        updateVolume(event.nativeEvent.locationX);
      },
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityValue={{ max: 100, min: 0, now: Math.round(value * 100) }}
      onLayout={(event) => {
        widthRef.current = event.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
      style={{ height: 34, justifyContent: "center", width: "100%" }}
    >
      <View
        style={{
          backgroundColor: theme.track,
          borderRadius: 999,
          height: 6,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            backgroundColor: theme.accent,
            height: "100%",
            width: `${value * 100}%`,
          }}
        />
      </View>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: theme.accent,
          borderColor: theme.card,
          borderRadius: 9,
          borderWidth: 3,
          height: 18,
          left: `${value * 100}%`,
          marginLeft: -9,
          position: "absolute",
          width: 18,
        }}
      />
    </View>
  );
}

function QueueTrackRow({
  drag,
  index,
  isActive,
  isPlaying,
  onPress,
  onRemove,
  track,
}: {
  drag: () => void;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPress: () => void;
  onRemove: () => void;
  track: MediaLibrary.Asset;
}) {
  const theme = useAppTheme();
  const isActiveRef = useRef(isActive);
  const translateX = useRef(new Animated.Value(0)).current;
  const onRemoveRef = useRef(onRemove);
  isActiveRef.current = isActive;
  onRemoveRef.current = onRemove;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !isActiveRef.current &&
        gesture.dx > 8 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        !isActiveRef.current &&
        gesture.dx > 8 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.25,
      onPanResponderMove: (_, gesture) => {
        if (isActiveRef.current) return;
        translateX.setValue(Math.min(Math.max(gesture.dx, 0), 132));
      },
      onPanResponderRelease: (_, gesture) => {
        if (isActiveRef.current) {
          translateX.setValue(0);
          return;
        }
        if (gesture.dx >= 92) {
          Animated.timing(translateX, {
            duration: 160,
            toValue: 420,
            useNativeDriver: true,
          }).start(() => onRemoveRef.current());
          return;
        }

        Animated.spring(translateX, {
          bounciness: 4,
          speed: 18,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          bounciness: 4,
          speed: 18,
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  return (
    <View style={{ borderRadius: 14, overflow: "hidden" }}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#FF5D72",
          bottom: 0,
          flexDirection: "row",
          gap: 6,
          left: 0,
          paddingHorizontal: 16,
          position: "absolute",
          top: 0,
        }}
      >
        <Ionicons color="#FFFFFF" name="trash-outline" size={20} />
        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "900" }}>
          Remove
        </Text>
      </View>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ opacity: isActive ? 0.9 : 1, transform: [{ translateX }] }}
      >
        <SongListRow
          artworkSource={track}
          artist={getTrackArtist(track)}
          duration={track.duration}
          index={index}
          isCurrentTrack={false}
          isPlaying={isPlaying}
          onPress={onPress}
          rightAccessory={
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <Pressable
                accessibilityHint="Press and drag to reorder"
                accessibilityLabel={`Reorder ${getTrackTitle(track)}`}
                accessibilityRole="button"
                hitSlop={4}
                onPressIn={() => {
                  translateX.setValue(0);
                  drag();
                }}
                style={({ pressed }) => ({
                  alignItems: "center",
                  height: 34,
                  justifyContent: "center",
                  opacity: pressed || isActive ? 0.55 : 1,
                  width: 34,
                })}
              >
                <Ionicons
                  color={isActive ? theme.accent : theme.secondary}
                  name="reorder-three-outline"
                  size={21}
                />
              </Pressable>
              <Pressable
                accessibilityLabel={`Remove ${getTrackTitle(track)} from queue`}
                accessibilityRole="button"
                disabled={isActive}
                hitSlop={4}
                onPress={onRemove}
                style={({ pressed }) => ({
                  alignItems: "center",
                  height: 34,
                  justifyContent: "center",
                  opacity: pressed || isActive ? 0.55 : 1,
                  width: 34,
                })}
              >
                <Ionicons color="#FF5D72" name="trash-outline" size={19} />
              </Pressable>
            </View>
          }
          title={getTrackTitle(track)}
        />
      </Animated.View>
    </View>
  );
}

function getAudioRouteIcon(type: AudioOutputRoute["type"]): IconName {
  if (type === "bluetooth") return "bluetooth";
  if (type === "tv") return "tv-outline";
  if (type === "speaker") return "phone-portrait-outline";
  return "volume-high-outline";
}

function PreviousButton() {
  const { canGoPrevious, playPrevious } = usePlayerStore(
    useShallow((state) => ({
      canGoPrevious:
        state.position > 3 ||
        state.currentIndex > 0 ||
        (state.queue.length > 1 &&
          (state.repeatMode === "all" || state.shuffleEnabled)),
      playPrevious: state.playPrevious,
    })),
  );

  return (
    <RoundButton
      disabled={!canGoPrevious}
      icon="play-skip-back"
      onPress={() => {
        void playPrevious();
      }}
    />
  );
}

export default function PlayerScreen() {
  const theme = useAppTheme();
  const {
    currentIndex,
    currentTrack,
    error,
    isPlaying,
    cycleRepeatMode,
    playNext,
    playSong,
    queue,
    moveQueueItem,
    removeQueueItem,
    repeatMode,
    setVolume,
    togglePlayback,
    toggleShuffle,
    shuffleEnabled,
    volume,
  } = usePlayerStore(
    useShallow((state) => ({
      currentIndex: state.currentIndex,
      currentTrack: state.currentTrack,
      error: state.error,
      isPlaying: state.isPlaying,
      cycleRepeatMode: state.cycleRepeatMode,
      playNext: state.playNext,
      playSong: state.playSong,
      queue: state.queue,
      moveQueueItem: state.moveQueueItem,
      removeQueueItem: state.removeQueueItem,
      repeatMode: state.repeatMode,
      setVolume: state.setVolume,
      togglePlayback: state.togglePlayback,
      toggleShuffle: state.toggleShuffle,
      shuffleEnabled: state.shuffleEnabled,
      volume: state.volume,
    })),
  );
  const equalizerPreset = useSettingsStore((state) => state.equalizerPreset);
  const setEqualizerPreset = useSettingsStore(
    (state) => state.setEqualizerPreset,
  );
  const setSleepTimerMinutes = useSettingsStore(
    (state) => state.setSleepTimerMinutes,
  );
  const sleepTimerMinutes = useSettingsStore((state) => state.sleepTimerMinutes);
  const favoriteSongIds = useUserLibraryStore((state) => state.favoriteSongIds);
  const toggleFavorite = useUserLibraryStore((state) => state.toggleFavorite);
  const [activeSheet, setActiveSheet] = useState<
    "queue" | "timer" | "equalizer" | "output" | null
  >(null);
  const [audioRoutes, setAudioRoutes] = useState<AudioOutputRoute[]>([]);
  const [audioRouteError, setAudioRouteError] = useState<string | null>(null);
  const [loadingAudioRoutes, setLoadingAudioRoutes] = useState(false);
  const [selectingAudioRouteId, setSelectingAudioRouteId] = useState<
    string | null
  >(null);
  const [customTimerText, setCustomTimerText] = useState("");
  const canGoNext =
    (currentIndex >= 0 && currentIndex < queue.length - 1) ||
    (queue.length > 1 && (repeatMode === "all" || shuffleEnabled));
  const upcomingTracks = queue.slice(currentIndex + 1);
  const customTimerMinutes = Number.parseInt(customTimerText, 10);
  const customTimerIsValid =
    Number.isFinite(customTimerMinutes) &&
    customTimerMinutes >= 1 &&
    customTimerMinutes <= 1440;

  const applyCustomTimer = () => {
    if (!customTimerIsValid) return;
    setSleepTimerMinutes(customTimerMinutes);
    setCustomTimerText("");
    setActiveSheet(null);
  };

  const loadAudioRoutes = useCallback(async () => {
    setLoadingAudioRoutes(true);
    setAudioRouteError(null);

    try {
      setAudioRoutes(await getAudioOutputRoutes());
    } catch (loadError) {
      setAudioRouteError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load audio outputs.",
      );
    } finally {
      setLoadingAudioRoutes(false);
    }
  }, []);

  useEffect(() => {
    if (activeSheet === null) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setActiveSheet(null);
        return true;
      },
    );

    return () => subscription.remove();
  }, [activeSheet]);

  useEffect(() => {
    if (activeSheet === "output") {
      void loadAudioRoutes();
    }
  }, [activeSheet, loadAudioRoutes]);

  if (!currentTrack) {
    return (
      <View
        style={{
          backgroundColor: theme.background,
          flex: 1,
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ left: 16, padding: 8, position: "absolute", top: 18 }}
        >
          <Ionicons name="chevron-down" size={28} color={theme.icon} />
        </Pressable>

        <Text style={{ color: theme.primary, fontSize: 24, fontWeight: "900" }}>
          No song selected
        </Text>
        <Text style={{ color: theme.secondary, fontSize: 14, marginTop: 8 }}>
          Pick a song from your library to start playback.
        </Text>
      </View>
    );
  }

  const currentMetadata = currentTrack as MusicAsset;
  const albumTitle = currentMetadata.albumTitle?.trim() || UNKNOWN_ALBUM;
  const isFavorite = favoriteSongIds.includes(currentTrack.id);

  const shareCurrentTrack = () => {
    void Share.share({
      message: `${getTrackTitle(currentTrack)} by ${getTrackArtist(currentTrack)}\nAlbum: ${albumTitle}`,
      title: getTrackTitle(currentTrack),
    });
  };

  return (
    <View
      style={{
        backgroundColor: theme.background,
        flex: 1,
        paddingBottom: 28,
        paddingHorizontal: 24,
        paddingTop: 14,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <RoundButton
          icon="chevron-down"
          onPress={() => {
            router.back();
          }}
        />
        <View style={{ alignItems: "center" }}>
          <Text
            style={{ color: theme.secondary, fontSize: 10, fontWeight: "900" }}
          >
            PLAYING FROM
          </Text>
          <Text
            style={{ color: theme.primary, fontSize: 12, fontWeight: "900" }}
          >
            {albumTitle}
          </Text>
        </View>
        <RoundButton
          icon="share-social-outline"
          onPress={shareCurrentTrack}
        />
      </View>

      <View
        style={{
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          gap: 24,
        }}
      >
        <View
          style={[
            {
              alignItems: "center",
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 32,
              borderWidth: 1,
              height: 256,
              justifyContent: "center",
              width: 256,
            },
            softShadow(theme.isDark, "high"),
          ]}
        >
          {Array.from({ length: 26 }).map((_, index) => {
            const height = 26 + ((index * 11) % 42);
            return (
              <View
                key={index}
                style={{
                  backgroundColor: index % 2 ? "#3882F6" : theme.accent,
                  borderRadius: 2,
                  height,
                  left: 126 + Math.cos(index * 0.241) * 106,
                  opacity: 0.5,
                  position: "absolute",
                  top: 126 + Math.sin(index * 0.241) * 88 - height / 2,
                  transform: [{ rotate: `${index * 14}deg` }],
                  width: 4,
                }}
              />
            );
          })}
          <Artwork size={176} index={0} source={currentTrack} />
        </View>

        <View style={{ alignItems: "center", width: "100%" }}>
          <Text
            numberOfLines={2}
            style={{
              color: theme.primary,
              fontSize: 25,
              fontWeight: "900",
              lineHeight: 30,
              textAlign: "center",
            }}
          >
            {getTrackTitle(currentTrack)}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 13, marginTop: 6 }}>
            {getTrackArtist(currentTrack)}
          </Text>
        </View>

        <PlayerProgress />

        {error ? (
          <Text style={{ color: "#FF6B8A", fontSize: 13, textAlign: "center" }}>
            {error}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: 20 }}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <RoundButton
            active={shuffleEnabled}
            icon="shuffle"
            onPress={toggleShuffle}
          />
          <PreviousButton />
          <RoundButton
            prominent
            icon={isPlaying ? "pause" : "play"}
            onPress={() => {
              void togglePlayback();
            }}
          />
          <RoundButton
            disabled={!canGoNext}
            icon="play-skip-forward"
            onPress={() => {
              void playNext();
            }}
          />
          <RoundButton
            active={repeatMode !== "off"}
            badge={repeatMode === "one" ? "1" : undefined}
            icon="repeat"
            onPress={cycleRepeatMode}
          />
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
              justifyContent: "space-around",
              paddingVertical: 13,
            },
            softShadow(theme.isDark, "low"),
          ]}
        >
          <UtilityButton
            icon="list"
            label="Up next"
            onPress={() => setActiveSheet("queue")}
          />
          <UtilityButton
            active={sleepTimerMinutes !== null}
            icon="timer-outline"
            label="Timer"
            onPress={() => setActiveSheet("timer")}
          />
          <UtilityButton
            active={isFavorite}
            icon={isFavorite ? "heart" : "heart-outline"}
            label="Favorite"
            onPress={() => toggleFavorite(currentTrack.id)}
          />
          <UtilityButton
            active={equalizerPreset !== "off"}
            icon="options-outline"
            label="Equalizer"
            onPress={() => setActiveSheet("equalizer")}
          />
          <UtilityButton
            icon="volume-high-outline"
            label="Output"
            onPress={() => setActiveSheet("output")}
          />
        </View>
      </View>

      {activeSheet !== null ? (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { elevation: 100, justifyContent: "flex-end", zIndex: 100 },
          ]}
        >
          <Pressable
            accessibilityLabel="Close player options"
            accessibilityRole="button"
            onPress={() => setActiveSheet(null)}
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0,0,0,0.48)" },
            ]}
          />
          <View
            style={{
              backgroundColor: theme.background,
              borderColor: theme.border,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              borderWidth: 1,
              gap: 16,
              paddingBottom: 30,
              paddingHorizontal: 22,
              paddingTop: 18,
            }}
          >
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ color: theme.primary, fontSize: 18, fontWeight: "900" }}
              >
                {activeSheet === "queue"
                  ? "Coming tracks"
                  : activeSheet === "timer"
                    ? "Sleep timer"
                    : activeSheet === "equalizer"
                      ? "Equalizer"
                      : "Audio output"}
              </Text>
              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setActiveSheet(null)}
              >
                <Ionicons name="close" color={theme.icon} size={24} />
              </Pressable>
            </View>

            {activeSheet === "queue" ? (
              upcomingTracks.length > 0 ? (
                <DraggableFlatList
                  activationDistance={8}
                  autoscrollThreshold={44}
                  contentContainerStyle={{ gap: 8 }}
                  data={upcomingTracks}
                  dragItemOverflow
                  initialNumToRender={5}
                  keyExtractor={(track) => track.id}
                  maxToRenderPerBatch={6}
                  onDragEnd={({ from, to }) => {
                    moveQueueItem(currentIndex + from + 1, currentIndex + to + 1);
                  }}
                  removeClippedSubviews={false}
                  renderItem={({ drag, getIndex, isActive, item: track }) => {
                    const index = getIndex() ?? 0;
                    const queueIndex = currentIndex + index + 1;
                    return (
                      <ScaleDecorator activeScale={1.025}>
                        <QueueTrackRow
                          drag={drag}
                          index={queueIndex}
                          isActive={isActive}
                          isPlaying={isPlaying}
                          onPress={() => {
                            setActiveSheet(null);
                            void playSong(track, queue);
                          }}
                          onRemove={() => removeQueueItem(track.id)}
                          track={track}
                        />
                      </ScaleDecorator>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                  style={{
                    height: Math.min(upcomingTracks.length * 72, 360),
                  }}
                  windowSize={5}
                />
              ) : (
                <Text style={{ color: theme.secondary, fontSize: 13 }}>
                  No more tracks in this queue.
                </Text>
              )
            ) : null}

            {activeSheet === "timer" ? (
              <View style={{ gap: 14 }}>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                >
                  {([null, 15, 30, 45, 60] as (number | null)[]).map(
                    (minutes) => {
                      const selected = sleepTimerMinutes === minutes;
                      return (
                        <Pressable
                          key={minutes ?? "off"}
                          onPress={() => {
                            setSleepTimerMinutes(minutes);
                            setActiveSheet(null);
                          }}
                          style={{
                            alignItems: "center",
                            backgroundColor: selected ? theme.accent : theme.card,
                            borderColor: selected ? theme.accent : theme.border,
                            borderRadius: 8,
                            borderWidth: 1,
                            minWidth: 82,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: selected ? "#FFFFFF" : theme.primary,
                              fontSize: 12,
                              fontWeight: "900",
                            }}
                          >
                            {minutes === null ? "Off" : `${minutes} min`}
                          </Text>
                        </Pressable>
                      );
                    },
                  )}
                </View>

                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      color: theme.secondary,
                      fontSize: 11,
                      fontWeight: "900",
                    }}
                  >
                    CUSTOM TIMER
                  </Text>
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        borderRadius: 8,
                        borderWidth: 1,
                        flex: 1,
                        flexDirection: "row",
                        minHeight: 48,
                        paddingHorizontal: 12,
                      }}
                    >
                      <TextInput
                        accessibilityLabel="Custom sleep timer minutes"
                        keyboardType="number-pad"
                        maxLength={4}
                        onChangeText={(value) => {
                          setCustomTimerText(value.replace(/\D/g, "").slice(0, 4));
                        }}
                        onSubmitEditing={applyCustomTimer}
                        placeholder="Minutes"
                        placeholderTextColor={theme.muted}
                        returnKeyType="done"
                        style={{
                          color: theme.primary,
                          flex: 1,
                          fontSize: 14,
                          fontWeight: "800",
                          paddingVertical: 10,
                        }}
                        value={customTimerText}
                      />
                      <Text style={{ color: theme.secondary, fontSize: 12 }}>
                        min
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel="Set custom sleep timer"
                      accessibilityRole="button"
                      android_ripple={{ color: `${theme.accent}20` }}
                      disabled={!customTimerIsValid}
                      onPress={applyCustomTimer}
                      style={{
                        alignItems: "center",
                        backgroundColor: customTimerIsValid
                          ? theme.accent
                          : theme.cardSoft,
                        borderColor: customTimerIsValid
                          ? theme.accent
                          : theme.border,
                        borderRadius: 8,
                        borderWidth: 1,
                        height: 48,
                        justifyContent: "center",
                        width: 48,
                      }}
                    >
                      <Ionicons
                        color={customTimerIsValid ? "#FFFFFF" : theme.muted}
                        name="checkmark"
                        size={23}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : null}

            {activeSheet === "equalizer" ? (
              <View style={{ gap: 8 }}>
                {(
                  ["off", "balanced", "bass", "vocal", "treble"] as const
                ).map((preset: EqualizerPreset) => {
                  const selected = equalizerPreset === preset;
                  return (
                    <Pressable
                      key={preset}
                      onPress={() => {
                        setEqualizerPreset(preset);
                        setActiveSheet(null);
                      }}
                      style={{
                        alignItems: "center",
                        backgroundColor: selected ? theme.cardSoft : "transparent",
                        borderColor: selected ? theme.accent : theme.border,
                        borderRadius: 8,
                        borderWidth: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        minHeight: 46,
                        paddingHorizontal: 14,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.primary,
                          fontSize: 13,
                          fontWeight: "800",
                          textTransform: "capitalize",
                        }}
                      >
                        {preset}
                      </Text>
                      {selected ? (
                        <Ionicons
                          color={theme.accent}
                          name="checkmark-circle"
                          size={20}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {activeSheet === "output" ? (
              <View style={{ gap: 16 }}>
                <View
                  style={{
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderRadius: 10,
                    borderWidth: 1,
                    gap: 4,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}
                >
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 8,
                      }}
                    >
                      <Ionicons
                        color={theme.secondary}
                        name={volume === 0 ? "volume-mute" : "volume-high"}
                        size={19}
                      />
                      <Text
                        style={{
                          color: theme.primary,
                          fontSize: 13,
                          fontWeight: "900",
                        }}
                      >
                        Volume
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: theme.accent,
                        fontSize: 12,
                        fontWeight: "900",
                      }}
                    >
                      {Math.round(volume * 100)}%
                    </Text>
                  </View>
                  <VolumeSlider onChange={setVolume} value={volume} />
                </View>

                <View style={{ gap: 8 }}>
                  <View
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: theme.secondary,
                        fontSize: 11,
                        fontWeight: "900",
                      }}
                    >
                      AVAILABLE DEVICES
                    </Text>
                    <Pressable
                      accessibilityLabel="Refresh audio outputs"
                      accessibilityRole="button"
                      disabled={loadingAudioRoutes}
                      hitSlop={8}
                      onPress={() => void loadAudioRoutes()}
                    >
                      <Ionicons
                        color={theme.accent}
                        name="refresh"
                        size={19}
                      />
                    </Pressable>
                  </View>

                  {loadingAudioRoutes ? (
                    <View
                      style={{
                        alignItems: "center",
                        minHeight: 64,
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: theme.secondary, fontSize: 12 }}>
                        Finding audio outputs...
                      </Text>
                    </View>
                  ) : audioRouteError ? (
                    <Text style={{ color: "#FF5D72", fontSize: 12 }}>
                      {audioRouteError}
                    </Text>
                  ) : audioRoutes.length === 0 ? (
                    <Text style={{ color: theme.secondary, fontSize: 12 }}>
                      No selectable audio outputs are currently available.
                    </Text>
                  ) : (
                    audioRoutes.map((route) => (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: route.selected }}
                        disabled={selectingAudioRouteId !== null}
                        key={route.id}
                        onPress={() => {
                          setSelectingAudioRouteId(route.id);
                          setAudioRouteError(null);
                          void selectAudioOutputRoute(route.id)
                            .then(loadAudioRoutes)
                            .catch((selectionError) => {
                              setAudioRouteError(
                                selectionError instanceof Error
                                  ? selectionError.message
                                  : "Unable to change audio output.",
                              );
                            })
                            .finally(() => setSelectingAudioRouteId(null));
                        }}
                        android_ripple={{ color: `${theme.accent}18` }}
                        style={{
                          alignItems: "center",
                          backgroundColor: route.selected
                            ? theme.cardSoft
                            : theme.card,
                          borderColor: route.selected
                            ? theme.accent
                            : theme.border,
                          borderRadius: 8,
                          borderWidth: 1,
                          flexDirection: "row",
                          gap: 12,
                          minHeight: 52,
                          paddingHorizontal: 14,
                          width: "100%",
                        }}
                      >
                        <Ionicons
                          color={route.selected ? theme.accent : theme.secondary}
                          name={getAudioRouteIcon(route.type)}
                          size={21}
                        />
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: theme.primary,
                              fontSize: 13,
                              fontWeight: "900",
                            }}
                          >
                            {route.name}
                          </Text>
                          {route.description ? (
                            <Text
                              numberOfLines={1}
                              style={{ color: theme.secondary, fontSize: 11 }}
                            >
                              {route.description}
                            </Text>
                          ) : null}
                        </View>
                        <Ionicons
                          color={route.selected ? theme.accent : theme.secondary}
                          name={
                            route.selected
                              ? "radio-button-on"
                              : "radio-button-off"
                          }
                          size={19}
                        />
                      </Pressable>
                    ))
                  )}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
