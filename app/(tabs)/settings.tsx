import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { SoftSurface, useAppTheme } from "../../components/DesignSystem";
import { getAvailableMusicFolders } from "../../services/library/scanner.service";
import { useLibraryStore } from "../../store/library.store";
import { ThemeMode, useSettingsStore } from "../../store/settings.store";

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
  const [isFolderConfigOpen, setIsFolderConfigOpen] = useState(false);

  const userName = useSettingsStore((state) => state.userName);
  const excludedFolderPaths = useSettingsStore((state) => state.excludedFolderPaths);
  const sleepTimerMinutes = useSettingsStore((state) => state.sleepTimerMinutes);
  const themeMode = useSettingsStore((state) => state.themeMode);
  const clearFolderSelection = useSettingsStore(
    (state) => state.clearFolderSelection,
  );
  const setSleepTimerMinutes = useSettingsStore(
    (state) => state.setSleepTimerMinutes,
  );
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const setUserName = useSettingsStore((state) => state.setUserName);
  const toggleFolderSelection = useSettingsStore(
    (state) => state.toggleFolderSelection,
  );
  const loadLibraryData = useLibraryStore((state) => state.loadLibraryData);
  const libraryLoading = useLibraryStore((state) => state.loading);

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
        <Row icon="person-outline" title="Display Name">
          <TextInput
            onChangeText={setUserName}
            placeholder="Your name"
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
        {(["light", "dark", "auto"] as ThemeMode[]).map((option) => {
          const selected = themeMode === option;
          const label = option === "auto" ? "System Default" : `${option[0].toUpperCase()}${option.slice(1)} Mode`;

          return (
            <Pressable
              key={option}
              onPress={() => setThemeMode(option)}
              style={{ borderRadius: 12 }}
            >
              <Row
                icon={
                  option === "light"
                    ? "sunny-outline"
                    : option === "dark"
                      ? "moon-outline"
                      : "sync-circle-outline"
                }
                title={label}
              >
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  color={selected ? theme.accent : theme.secondary}
                  size={18}
                />
              </Row>
            </Pressable>
          );
        })}
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

      <Section title="Sleep Timer">
        <Row icon="timer-outline" title="Sleep Timer">
          <View style={{ flexDirection: "row", gap: 6 }}>
            {([null, 15, 30, 60] as (number | null)[]).map((minutes) => {
              const selected = sleepTimerMinutes === minutes;
              const label = minutes === null ? "Off" : `${minutes}`;

              return (
                <Pressable
                  key={label}
                  onPress={() => setSleepTimerMinutes(minutes)}
                  style={{
                    backgroundColor: selected ? theme.accent : theme.cardSoft,
                    borderRadius: 12,
                    paddingHorizontal: 9,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? "#FFFFFF" : theme.secondary,
                      fontSize: 11,
                      fontWeight: "900",
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Row>
      </Section>

      <Section title="About">
        <Row icon="phone-portrait-outline" title="App Version">
          <Text style={{ color: theme.secondary, fontSize: 12, fontWeight: "800" }}>
            1.0.0
          </Text>
        </Row>
        <Row icon="shield-checkmark-outline" title="Privacy Policy">
          <Ionicons name="chevron-forward" color={theme.secondary} size={17} />
        </Row>
      </Section>
    </ScrollView>
  );
}
