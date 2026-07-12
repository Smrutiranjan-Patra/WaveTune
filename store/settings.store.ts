import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "auto";

interface SettingsState {
  themeMode: ThemeMode;
  sleepTimerMinutes: number | null;
  excludedFolderPaths: string[];
  setThemeMode: (themeMode: ThemeMode) => void;
  setSleepTimerMinutes: (minutes: number | null) => void;
  toggleFolderSelection: (folderPath: string) => void;
  clearFolderSelection: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: "auto",
  sleepTimerMinutes: null,
  excludedFolderPaths: [],
  setThemeMode: (themeMode) => set({ themeMode }),
  setSleepTimerMinutes: (sleepTimerMinutes) => set({ sleepTimerMinutes }),
  toggleFolderSelection: (folderPath) =>
    set((state) => {
      const isExcluded = state.excludedFolderPaths.includes(folderPath);

      return {
        excludedFolderPaths: isExcluded
          ? state.excludedFolderPaths.filter((path) => path !== folderPath)
          : [...state.excludedFolderPaths, folderPath],
      };
    }),
  clearFolderSelection: () => set({ excludedFolderPaths: [] }),
}));
