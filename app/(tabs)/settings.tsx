import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { SoftSurface, useAppTheme } from "../../components/DesignSystem";
import { resetPersistedAppData } from "../../services/database/reset.service";
import { getAvailableMusicFolders } from "../../services/library/scanner.service";
import { useLibraryStore } from "../../store/library.store";
import { usePlayerStore } from "../../store/player.store";
import { ThemeMode, useSettingsStore } from "../../store/settings.store";
import { useUserLibraryStore } from "../../store/user-library.store";

type IconName = ComponentProps<typeof Ionicons>["name"];

type MusicFolder = {
  name: string;
  path: string;
};

function Row({
  children,
  icon,
  title,
}: {
  children?: ReactNode;
  icon: IconName;
  title: string;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        alignItems: "center",
        flexDirection: "row",
        gap: 12,
        minHeight: 48,
      }}
    >
      <Ionicons name={icon} color={theme.secondary} size={18} />
      <Text style={{ color: theme.primary, flex: 1, fontSize: 13, fontWeight: "800" }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Section({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const theme = useAppTheme();

  return (
    <View>
      <Text
        style={{
          color: theme.secondary,
          fontSize: 12,
          fontWeight: "900",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <SoftSurface style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
        {children}
      </SoftSurface>
    </View>
  );
}

export default function SettingScreen() {
  const theme = useAppTheme();
  const [folders, setFolders] = useState<MusicFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [applying, setApplying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isFolderConfigOpen, setIsFolderConfigOpen] = useState(false);

  const userName = useSettingsStore((state) => state.userName);
  const excludedFolderPaths = useSettingsStore((state) => state.excludedFolderPaths);
  const showActualArtwork = useSettingsStore((state) => state.showActualArtwork);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const clearFolderSelection = useSettingsStore(
    (state) => state.clearFolderSelection,
  );
  const resetSettingsState = useSettingsStore(
    (state) => state.resetSettingsState,
  );
  const setShowActualArtwork = useSettingsStore(
    (state) => state.setShowActualArtwork,
  );
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const setUserName = useSettingsStore((state) => state.setUserName);
  const toggleFolderSelection = useSettingsStore(
    (state) => state.toggleFolderSelection,
  );
  const loadLibraryData = useLibraryStore((state) => state.loadLibraryData);
  const resetLibraryState = useLibraryStore((state) => state.resetLibraryState);
  const libraryLoading = useLibraryStore((state) => state.loading);
  const cleanupPlayer = usePlayerStore((state) => state.cleanupPlayer);
  const resetUserLibraryState = useUserLibraryStore(
    (state) => state.resetUserLibraryState,
  );

  useEffect(() => {
    const loadFolders = async () => {
      setLoadingFolders(true);

      try {
        setFolders(await getAvailableMusicFolders());
      } finally {
        setLoadingFolders(false);
      }
    };

    void loadFolders();
  }, []);

  const handleApply = async () => {
    setApplying(true);

    try {
      await loadLibraryData();
    } finally {
      setApplying(false);
    }
  };

  const busy = applying || libraryLoading;

  const performReset = async () => {
    setResetting(true);

    try {
      await cleanupPlayer();
      await resetPersistedAppData();
      resetLibraryState();
      resetUserLibraryState();
      resetSettingsState();
      router.replace("/onboarding");
    } finally {
      setResetting(false);
    }
  };

  const confirmReset = () => {
    Alert.alert(
      "Reset WaveTune data?",
      "This removes your playlists, favorites, listening history, settings, and indexed library data. Music files on your device are not deleted.",
      [
        { style: "cancel", text: "Cancel" },
        {
          onPress: () => void performReset(),
          style: "destructive",
          text: "Reset App Data",
        },
      ],
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={{
        gap: 18,
        paddingBottom: 110,
        paddingHorizontal: 22,
        paddingTop: 10,
      }}
    >
      <Text style={{ color: theme.primary, fontSize: 24, fontWeight: "900" }}>
        Settings
      </Text>

      <Section title="Profile">
        <Row icon="person-outline" title="Nickname">
          <TextInput
            onChangeText={setUserName}
            placeholder="Choose a nickname"
            placeholderTextColor={theme.muted}
            style={{
              color: theme.primary,
              flex: 1,
              fontSize: 13,
              fontWeight: "800",
              paddingVertical: 8,
              textAlign: "right",
            }}
            value={userName ?? ""}
          />
        </Row>
      </Section>

      <Section title="Appearance">
        <View
          style={{
            backgroundColor: theme.cardSoft,
            borderColor: theme.border,
            borderRadius: 10,
            borderWidth: 1,
            flexDirection: "row",
            gap: 4,
            marginBottom: 6,
            padding: 4,
          }}
        >
          {(["auto", "light", "dark"] as ThemeMode[]).map((option) => {
            const selected = themeMode === option;
            const label = option === "auto" ? "Auto" : `${option[0].toUpperCase()}${option.slice(1)}`;
            const icon =
              option === "light"
                ? "sunny-outline"
                : option === "dark"
                  ? "moon-outline"
                  : "contrast-outline";

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                android_ripple={{ color: `${theme.accent}20` }}
                key={option}
                onPress={() => setThemeMode(option)}
                style={{
                  alignItems: "center",
                  backgroundColor: selected ? theme.accent : "transparent",
                  borderRadius: 7,
                  flex: 1,
                  flexDirection: "row",
                  gap: 6,
                  justifyContent: "center",
                  minHeight: 42,
                  minWidth: 0,
                  overflow: "hidden",
                  paddingHorizontal: 6,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    height: 18,
                    justifyContent: "center",
                    width: 18,
                  }}
                >
                  <Ionicons
                    color={selected ? "#FFFFFF" : theme.secondary}
                    name={icon}
                    size={17}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: selected ? "#FFFFFF" : theme.primary,
                    fontSize: 11,
                    fontWeight: "900",
                    lineHeight: 16,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Row icon="image-outline" title="Use Album Artwork">
          <Switch
            onValueChange={setShowActualArtwork}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.track, true: theme.accent }}
            value={showActualArtwork}
          />
        </Row>
      </Section>

      {/* <Section title="Playback">
        <Row icon="git-compare-outline" title="Crossfade">
          <Switch
            value={crossfade}
            onValueChange={setCrossfade}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.track, true: theme.accent }}
          />
        </Row>
        <Row icon="play-forward-circle-outline" title="Gapless Playback">
          <Switch
            value={gaplessPlayback}
            onValueChange={setGaplessPlayback}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.track, true: theme.accent }}
          />
        </Row>
        <Row icon="volume-medium-outline" title="Audio Focus">
          <Switch
            value={audioFocus}
            onValueChange={setAudioFocus}
            thumbColor="#FFFFFF"
            trackColor={{ false: theme.track, true: theme.accent }}
          />
        </Row>
      </Section> */}

      <Section title="Library">
        <Pressable onPress={handleApply} disabled={busy}>
          <Row icon="refresh-outline" title="Rescan Music Library">
            {busy ? (
              <ActivityIndicator color={theme.accent} />
            ) : (
              <Ionicons name="chevron-forward" color={theme.secondary} size={17} />
            )}
          </Row>
        </Pressable>
        <Pressable onPress={() => setIsFolderConfigOpen((value) => !value)}>
          <Row icon="folder-open-outline" title="Excluded Folders">
            <Text style={{ color: theme.secondary, fontSize: 12, fontWeight: "800" }}>
              {excludedFolderPaths.length}
            </Text>
          </Row>
        </Pressable>

        {isFolderConfigOpen ? (
          <View style={{ gap: 10, paddingBottom: 8, paddingTop: 6 }}>
            <View style={{ alignItems: "center", flexDirection: "row" }}>
              <Text style={{ color: theme.secondary, flex: 1, fontSize: 12 }}>
                Available folders ({folders.length})
              </Text>
              <Pressable onPress={clearFolderSelection}>
                <Text style={{ color: theme.accent, fontSize: 12, fontWeight: "900" }}>
                  Reset all
                </Text>
              </Pressable>
            </View>

            {loadingFolders ? (
              <ActivityIndicator color={theme.accent} />
            ) : folders.length === 0 ? (
              <Text style={{ color: theme.secondary, fontSize: 12 }}>
                No music folders found.
              </Text>
            ) : (
              folders.map((folder) => {
                const isExcluded = excludedFolderPaths.includes(folder.path);

                return (
                  <View
                    key={folder.path}
                    style={{
                      alignItems: "center",
                      flexDirection: "row",
                      gap: 10,
                      paddingVertical: 8,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{ color: theme.primary, fontSize: 12, fontWeight: "800" }}
                      >
                        {folder.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{ color: theme.secondary, fontSize: 10 }}
                      >
                        {folder.path}
                      </Text>
                    </View>
                    <Switch
                      value={!isExcluded}
                      onValueChange={() => toggleFolderSelection(folder.path)}
                      thumbColor="#FFFFFF"
                      trackColor={{ false: theme.track, true: theme.accent }}
                    />
                  </View>
                );
              })
            )}
          </View>
        ) : null}
      </Section>

      <Section title="Privacy & Data">
        <Pressable onPress={() => router.push("/privacy-policy")}>
          <Row icon="shield-checkmark-outline" title="Privacy Policy">
            <Ionicons name="chevron-forward" color={theme.secondary} size={17} />
          </Row>
        </Pressable>
        <Pressable disabled={resetting} onPress={confirmReset}>
          <Row icon="trash-bin-outline" title="Reset App Data">
            {resetting ? (
              <ActivityIndicator color="#EF476F" />
            ) : (
              <Ionicons name="chevron-forward" color="#EF476F" size={17} />
            )}
          </Row>
        </Pressable>
      </Section>

      <Section title="About">
        <Row icon="phone-portrait-outline" title="App Version">
          <Text style={{ color: theme.secondary, fontSize: 12, fontWeight: "800" }}>
            1.0.0
          </Text>
        </Row>
      </Section>
    </ScrollView>
  );
}
