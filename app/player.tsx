import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useRef, useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";

import {
  Artwork,
  formatTime,
  getTrackArtist,
  getTrackTitle,
  softShadow,
  useAppTheme,
} from "../components/DesignSystem";
import { usePlayerStore } from "../store/player.store";

type IconName = ComponentProps<typeof Ionicons>["name"];

function RoundButton({
  disabled,
  icon,
  onPress,
  prominent = false,
}: {
  disabled?: boolean;
  icon: IconName;
  onPress: () => void;
  prominent?: boolean;
}) {
  const theme = useAppTheme();
  const size = prominent ? 76 : 46;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          alignItems: "center",
          backgroundColor: prominent ? theme.accent : theme.card,
          borderColor: prominent ? theme.accent : theme.border,
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
        color={prominent ? "#FFFFFF" : theme.icon}
        size={prominent ? 34 : 22}
      />
    </Pressable>
  );
}

export default function PlayerScreen() {
  const theme = useAppTheme();
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
      onMoveShouldSetPanResponder: () => duration > 0,
      onPanResponderGrant: (event) => {
        const nextPosition = getSeekPosition(event.nativeEvent.locationX);
        setIsScrubbing(true);
        setScrubPosition(nextPosition);
      },
      onPanResponderMove: (event) => {
        setScrubPosition(getSeekPosition(event.nativeEvent.locationX));
      },
      onPanResponderRelease: (event) => {
        setIsScrubbing(false);
        void seekFromTouch(event.nativeEvent.locationX);
      },
      onPanResponderTerminate: () => {
        setIsScrubbing(false);
      },
      onStartShouldSetPanResponder: () => duration > 0,
    }),
  ).current;

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
          <Text style={{ color: theme.secondary, fontSize: 10, fontWeight: "900" }}>
            PLAYING FROM
          </Text>
          <Text style={{ color: theme.primary, fontSize: 12, fontWeight: "900" }}>
            Chill Vibes
          </Text>
        </View>
        <RoundButton icon="heart-outline" onPress={() => {}} />
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
          <Artwork size={176} index={0} />
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
            {getTrackTitle(currentTrack.filename)}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 13, marginTop: 6 }}>
            {getTrackArtist(currentIndex)}
          </Text>
        </View>

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
            icon="shuffle"
            onPress={() => {
              void seekBy(-10);
            }}
          />
          <RoundButton
            disabled={!canGoPrevious}
            icon="play-skip-back"
            onPress={() => {
              void playPrevious();
            }}
          />
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
            icon="repeat"
            onPress={() => {
              void seekBy(10);
            }}
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
          {["list", "timer-outline", "share-social-outline", "options-outline"].map(
            (icon) => (
              <Ionicons
                key={icon}
                name={icon as IconName}
                color={theme.secondary}
                size={20}
              />
            ),
          )}
        </View>
      </View>
    </View>
  );
}
