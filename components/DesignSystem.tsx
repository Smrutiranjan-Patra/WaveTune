import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Image, Text, useColorScheme, View } from "react-native";

import { useSettingsStore } from "../store/settings.store";

type IconName = ComponentProps<typeof Ionicons>["name"];

export const accent = "#6C63FF";

export const artworkPalette = [
  ["#5B3E9B", "#D35D8E"],
  ["#0E5E8D", "#59C0D8"],
  ["#743D8E", "#3A1D5B"],
  ["#C65A67", "#35235C"],
  ["#2F716D", "#122E45"],
  ["#D66A7A", "#7D2E45"],
  ["#3762A0", "#0D2440"],
  ["#9C6739", "#421F35"],
];

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.themeMode);
  const resolvedMode = themeMode === "auto" ? (colorScheme ?? "light") : themeMode;
  const isDark = resolvedMode === "dark";

  return {
    accent,
    background: isDark ? "#0B111B" : "#F5F6FF",
    card: isDark ? "#121B29" : "#FFFFFF",
    cardSoft: isDark ? "#172233" : "#F9FAFF",
    border: isDark ? "#243247" : "#E7E8F4",
    icon: isDark ? "#DDE4F6" : "#20243A",
    isDark,
    mode: resolvedMode,
    muted: isDark ? "#8D9BB3" : "#737A91",
    primary: isDark ? "#F8FAFF" : "#12162A",
    secondary: isDark ? "#AAB5C8" : "#5F667C",
    tabInactive: isDark ? "#8491A8" : "#747B91",
    track: isDark ? "#2B3548" : "#E6E7F3",
  };
}

export function softShadow(isDark: boolean, depth: "low" | "medium" | "high" = "medium") {
  const settings = {
    low: { elevation: 3, opacity: 0.08, radius: 8, y: 3 },
    medium: { elevation: 8, opacity: 0.12, radius: 16, y: 8 },
    high: { elevation: 14, opacity: 0.18, radius: 24, y: 14 },
  }[depth];

  return {
    elevation: settings.elevation,
    shadowColor: isDark ? "#000000" : "#8A8FB4",
    shadowOffset: { width: 0, height: settings.y },
    shadowOpacity: isDark ? settings.opacity + 0.08 : settings.opacity,
    shadowRadius: settings.radius,
  };
}

export function getTrackTitle(filename?: string) {
  if (!filename) {
    return "Unknown Track";
  }

  return filename.replace(/\.[^/.]+$/, "");
}

export function getTrackArtist(_index?: number) {
  return "Unknown Artist";
}

export function formatTime(totalSeconds?: number) {
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(totalSeconds ?? 0, 0)
    : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SectionHeader({
  action = "See All",
  title,
}: {
  action?: string;
  title: string;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <Text style={{ color: theme.primary, fontSize: 16, fontWeight: "800" }}>
        {title}
      </Text>
      <Text style={{ color: theme.accent, fontSize: 12, fontWeight: "800" }}>
        {action}
      </Text>
    </View>
  );
}

export function Artwork({
  icon = "musical-notes",
  imageUri,
  index = 0,
  size = 92,
}: {
  icon?: IconName;
  imageUri?: string | null;
  index?: number;
  size?: number;
}) {
  const theme = useAppTheme();
  const [from, to] = artworkPalette[index % artworkPalette.length];

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{
          backgroundColor: from,
          borderRadius: 12,
          height: size,
          width: size,
        }}
      />
    );
  }

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: from,
        borderColor: theme.isDark ? "#26344A" : "#EEF0FA",
        borderRadius: 12,
        borderWidth: 1,
        height: size,
        justifyContent: "center",
        overflow: "hidden",
        width: size,
      }}
    >
      <View
        style={{
          backgroundColor: to,
          borderRadius: size,
          height: size,
          opacity: 0.86,
          position: "absolute",
          right: -size * 0.35,
          top: -size * 0.3,
          width: size,
        }}
      />
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: size,
          bottom: -size * 0.45,
          height: size,
          left: -size * 0.4,
          opacity: theme.isDark ? 0.07 : 0.13,
          position: "absolute",
          width: size,
        }}
      />
      <Ionicons name={icon} color="#FFFFFF" size={Math.max(22, size * 0.34)} />
    </View>
  );
}

export function SoftSurface({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
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
        },
        softShadow(theme.isDark, "medium"),
        style,
      ]}
    >
      {children}
    </View>
  );
}
