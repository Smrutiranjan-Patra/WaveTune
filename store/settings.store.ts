import { create } from "zustand";

import {
  getPersistedSettings,
  setPersistedSetting,
} from "../services/database/settings.repository";

export type ThemeMode = "light" | "dark" | "auto";

interface SettingsState {
  audioFocus: boolean;
  crossfade: boolean;
  excludedFolderPaths: string[];
  floatingControlsHidden: boolean;
  gaplessPlayback: boolean;
  hydrated: boolean;
  sleepTimerMinutes: number | null;
  themeMode: ThemeMode;
  userName: string | null;
  hydrateSettings: () => Promise<void>;
  setAudioFocus: (enabled: boolean) => void;
  setCrossfade: (enabled: boolean) => void;
  setFloatingControlsHidden: (hidden: boolean) => void;
  setGaplessPlayback: (enabled: boolean) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setUserName: (userName: string) => void;
  setSleepTimerMinutes: (minutes: number | null) => void;
  toggleFolderSelection: (folderPath: string) => void;
  clearFolderSelection: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  audioFocus: true,
  crossfade: true,
  excludedFolderPaths: [],
  floatingControlsHidden: false,
  gaplessPlayback: true,
  hydrated: false,
  sleepTimerMinutes: null,
  themeMode: "auto",
  userName: null,

  hydrateSettings: async () => {
    const persisted = await getPersistedSettings();
    set({ ...persisted, hydrated: true });
  },
  setAudioFocus: (audioFocus) => {
    set({ audioFocus });
    void setPersistedSetting("audioFocus", audioFocus);
  },
  setCrossfade: (crossfade) => {
    set({ crossfade });
    void setPersistedSetting("crossfade", crossfade);
  },
  setFloatingControlsHidden: (floatingControlsHidden) => {
    set({ floatingControlsHidden });
    void setPersistedSetting("floatingControlsHidden", floatingControlsHidden);
  },
  setGaplessPlayback: (gaplessPlayback) => {
    set({ gaplessPlayback });
    void setPersistedSetting("gaplessPlayback", gaplessPlayback);
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
    set({ sleepTimerMinutes });
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
}));
