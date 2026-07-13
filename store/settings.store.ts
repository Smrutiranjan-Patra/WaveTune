import { create } from "zustand";

import {
  getPersistedSettings,
  setPersistedSetting,
} from "../services/database/settings.repository";

export type ThemeMode = "light" | "dark" | "auto";
export type EqualizerPreset =
  | "off"
  | "balanced"
  | "bass"
  | "vocal"
  | "treble";

interface SettingsState {
  audioFocus: boolean;
  crossfade: boolean;
  equalizerPreset: EqualizerPreset;
  excludedFolderPaths: string[];
  floatingControlsHidden: boolean;
  gaplessPlayback: boolean;
  hydrated: boolean;
  recentSearches: string[];
  showActualArtwork: boolean;
  sleepTimerEndsAt: number | null;
  sleepTimerMinutes: number | null;
  themeMode: ThemeMode;
  userName: string | null;
  hydrateSettings: () => Promise<void>;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (query: string) => void;
  setAudioFocus: (enabled: boolean) => void;
  setCrossfade: (enabled: boolean) => void;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setFloatingControlsHidden: (hidden: boolean) => void;
  setGaplessPlayback: (enabled: boolean) => void;
  setShowActualArtwork: (enabled: boolean) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setUserName: (userName: string) => void;
  setSleepTimerMinutes: (minutes: number | null) => void;
  toggleFolderSelection: (folderPath: string) => void;
  clearFolderSelection: () => void;
  resetSettingsState: () => void;
}

const defaultSettings = {
  audioFocus: true,
  crossfade: true,
  equalizerPreset: "off" as EqualizerPreset,
  excludedFolderPaths: [] as string[],
  floatingControlsHidden: false,
  gaplessPlayback: true,
  recentSearches: [] as string[],
  showActualArtwork: false,
  sleepTimerEndsAt: null as number | null,
  sleepTimerMinutes: null as number | null,
  themeMode: "auto" as ThemeMode,
  userName: null as string | null,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,
  hydrated: false,

  hydrateSettings: async () => {
    const persisted = await getPersistedSettings();
    set({ ...persisted, hydrated: true });
  },
  addRecentSearch: (query) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    const recentSearches = [
      normalizedQuery,
      ...get().recentSearches.filter(
        (item) =>
          item.toLocaleLowerCase() !== normalizedQuery.toLocaleLowerCase(),
      ),
    ].slice(0, 12);

    set({ recentSearches });
    void setPersistedSetting("recentSearches", recentSearches);
  },
  clearRecentSearches: () => {
    set({ recentSearches: [] });
    void setPersistedSetting("recentSearches", []);
  },
  removeRecentSearch: (query) => {
    const recentSearches = get().recentSearches.filter(
      (item) => item !== query,
    );
    set({ recentSearches });
    void setPersistedSetting("recentSearches", recentSearches);
  },
  setAudioFocus: (audioFocus) => {
    set({ audioFocus });
    void setPersistedSetting("audioFocus", audioFocus);
  },
  setCrossfade: (crossfade) => {
    set({ crossfade });
    void setPersistedSetting("crossfade", crossfade);
  },
  setEqualizerPreset: (equalizerPreset) => {
    set({ equalizerPreset });
    void setPersistedSetting("equalizerPreset", equalizerPreset);
  },
  setFloatingControlsHidden: (floatingControlsHidden) => {
    set({ floatingControlsHidden });
    void setPersistedSetting("floatingControlsHidden", floatingControlsHidden);
  },
  setGaplessPlayback: (gaplessPlayback) => {
    set({ gaplessPlayback });
    void setPersistedSetting("gaplessPlayback", gaplessPlayback);
  },
  setShowActualArtwork: (showActualArtwork) => {
    set({ showActualArtwork });
    void setPersistedSetting("showActualArtwork", showActualArtwork);
  },
  setThemeMode: (themeMode) => {
    set({ themeMode });
    void setPersistedSetting("themeMode", themeMode);
  },
  setUserName: (userName) => {
    const normalizedName = userName.trim();
    set({ userName: normalizedName || null });
    void setPersistedSetting("userName", normalizedName || null);
  },
  setSleepTimerMinutes: (sleepTimerMinutes) => {
    const sleepTimerEndsAt = sleepTimerMinutes
      ? Date.now() + sleepTimerMinutes * 60 * 1000
      : null;
    set({ sleepTimerEndsAt, sleepTimerMinutes });
    void setPersistedSetting("sleepTimerEndsAt", sleepTimerEndsAt);
    void setPersistedSetting("sleepTimerMinutes", sleepTimerMinutes);
  },
  toggleFolderSelection: (folderPath) => {
    const current = get().excludedFolderPaths;
    const excludedFolderPaths = current.includes(folderPath)
      ? current.filter((path) => path !== folderPath)
      : [...current, folderPath];
    set({ excludedFolderPaths });
    void setPersistedSetting("excludedFolderPaths", excludedFolderPaths);
  },
  clearFolderSelection: () => {
    set({ excludedFolderPaths: [] });
    void setPersistedSetting("excludedFolderPaths", []);
  },
  resetSettingsState: () => {
    set({ ...defaultSettings, hydrated: true });
  },
}));
