import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";

import { usePlayerStore } from "../store/player.store";

function formatTime(totalSeconds: number) {
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(totalSeconds, 0)
    : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getTrackTitle(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

export default function PlayerScreen() {
  const {
    currentIndex,
    currentTrack,
    duration,
    error,
    isPlaying,
    playNext,
    playPrevious,
    position,
    queue,
    seekTo,
    togglePlayback,
  } = usePlayerStore();
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);
  const progressBarWidth = useRef(0);

  const visiblePosition = isScrubbing ? scrubPosition : position;
  const progress = duration > 0 ? Math.min(visiblePosition / duration, 1) : 0;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < queue.length - 1;

  const seekBy = async (seconds: number) => {
    await seekTo(Math.min(Math.max(position + seconds, 0), duration || 0));
  };

  const getSeekPosition = (locationX: number) => {
    if (!duration || progressBarWidth.current <= 0) {
      return 0;
    }

    const clampedX = Math.min(Math.max(locationX, 0), progressBarWidth.current);
    return (clampedX / progressBarWidth.current) * duration;
  };

  const seekFromTouch = async (locationX: number) => {
    const nextPosition = getSeekPosition(locationX);
    setScrubPosition(nextPosition);
    await seekTo(nextPosition);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => duration > 0,
      onMoveShouldSetPanResponder: () => duration > 0,
      onPanResponderGrant: (event) => {
        const nextPosition = getSeekPosition(event.nativeEvent.locationX);
        setIsScrubbing(true);
        setScrubPosition(nextPosition);
      },
      onPanResponderMove: (event) => {
        const nextPosition = getSeekPosition(event.nativeEvent.locationX);
        setScrubPosition(nextPosition);
      },
      onPanResponderRelease: (event) => {
        setIsScrubbing(false);
        void seekFromTouch(event.nativeEvent.locationX);
      },
      onPanResponderTerminate: () => {
        setIsScrubbing(false);
      },
    }),
  ).current;

  if (!currentTrack) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F4F6FA",
          padding: 20,
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ position: "absolute", top: 18, left: 16, padding: 8 }}
        >
          <Ionicons name="chevron-down" size={28} color="#111827" />
        </Pressable>

        <Text style={{ fontSize: 24, fontWeight: "800", color: "#111827" }}>
          No song selected
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: "#6B7280" }}>
          Pick a song from your library to start playback.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F4F6FA",
        paddingHorizontal: 22,
        paddingTop: 16,
        paddingBottom: 26,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-down" size={30} color="#111827" />
        </Pressable>

        <Text style={{ fontSize: 14, fontWeight: "700", color: "#6B7280" }}>
          Now Playing
        </Text>

        <View style={{ width: 42 }} />
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <View
          style={{
            width: "84%",
            aspectRatio: 1,
            borderRadius: 8,
            backgroundColor: "#111827",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="musical-notes" size={92} color="#9AD872" />
        </View>

        <View style={{ width: "100%", alignItems: "center" }}>
          <Text
            numberOfLines={2}
            style={{
              textAlign: "center",
              fontSize: 24,
              lineHeight: 30,
              fontWeight: "800",
              color: "#111827",
            }}
          >
            {getTrackTitle(currentTrack.filename)}
          </Text>
          <Text
            numberOfLines={1}
            style={{ marginTop: 8, fontSize: 14, color: "#6B7280" }}
          >
            Track {currentIndex + 1} of {queue.length}
          </Text>
        </View>

        <View style={{ width: "100%" }}>
          <View
            onLayout={(event) => {
              progressBarWidth.current = event.nativeEvent.layout.width;
            }}
            {...panResponder.panHandlers}
            style={{
              height: 28,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                height: 8,
                borderRadius: 8,
                backgroundColor: "#D1D5DB",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  backgroundColor: "#111827",
                }}
              />
            </View>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: `${progress * 100}%`,
                width: 18,
                height: 18,
                marginLeft: -9,
                borderRadius: 8,
                backgroundColor: "#111827",
                borderWidth: 3,
                borderColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOpacity: 0.16,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            />
          </View>

          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "#6B7280", fontSize: 12 }}>
              {formatTime(visiblePosition)}
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 12 }}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {error ? (
          <Text style={{ color: "#B91C1C", textAlign: "center", fontSize: 13 }}>
            {error}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: 18 }}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => {
              void seekBy(-10);
            }}
            style={{
              width: 44,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="play-back" size={26} color="#111827" />
          </Pressable>

          <Pressable
            disabled={!canGoPrevious}
            onPress={() => {
              void playPrevious();
            }}
            style={{
              opacity: canGoPrevious ? 1 : 0.35,
              width: 46,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="play-skip-back" size={30} color="#111827" />
          </Pressable>

          <Pressable
            onPress={() => {
              void togglePlayback();
            }}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#111827",
            }}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={36}
              color="#FFFFFF"
            />
          </Pressable>

          <Pressable
            disabled={!canGoNext}
            onPress={() => {
              void playNext();
            }}
            style={{
              opacity: canGoNext ? 1 : 0.35,
              width: 46,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="play-skip-forward" size={30} color="#111827" />
          </Pressable>

          <Pressable
            onPress={() => {
              void seekBy(10);
            }}
            style={{
              width: 44,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="play-forward" size={26} color="#111827" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
