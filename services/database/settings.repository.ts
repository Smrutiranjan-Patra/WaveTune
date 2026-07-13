import { Directory, File, Paths } from "expo-file-system";

import { getDatabaseSync } from "./database.service";

export type PersistedSettings = {
  audioFocus: boolean;
  crossfade: boolean;
  equalizerPreset: "off" | "balanced" | "bass" | "vocal" | "treble";
  excludedFolderPaths: string[];
  floatingControlsHidden: boolean;
  gaplessPlayback: boolean;
  recentSearches: string[];
  showActualArtwork: boolean;
  sleepTimerEndsAt: number | null;
  sleepTimerMinutes: number | null;
  themeMode: "light" | "dark" | "auto";
  userName: string | null;
};

type SettingRow = { key: string; value: string };

const SETTINGS_FILE_NAME = "wavetune-settings.json";

function getSettingsFile() {
  const directory = new Directory(Paths.document, "wavetune");

  if (!directory.exists) {
    directory.create({ idempotent: true, intermediates: true });
  }

  return new File(directory, SETTINGS_FILE_NAME);
}

function readFallbackSettings() {
  try {
    const file = getSettingsFile();

    if (!file.exists) {
      return {};
    }

    const parsed = JSON.parse(file.textSync());

    return parsed && typeof parsed === "object"
      ? (parsed as Partial<PersistedSettings>)
      : {};
  } catch {
    return {};
  }
}

function writeFallbackSettings(settings: Partial<PersistedSettings>) {
  try {
    const file = getSettingsFile();

    if (!file.exists) {
      file.create({ intermediates: true, overwrite: true });
    }

    file.write(JSON.stringify(settings));
  } catch {
    // SQLite remains the primary store when the file fallback is unavailable.
  }
}

export async function getPersistedSettings() {
  const fallbackSettings = readFallbackSettings();
  const database = getDatabaseSync();
  if (!database) return fallbackSettings;

  const rows = database.getAllSync<SettingRow>(
    "SELECT key, value FROM settings",
  );
  const databaseSettings: Partial<PersistedSettings> = {};

  for (const row of rows) {
    try {
      (databaseSettings as Record<string, unknown>)[row.key] = JSON.parse(
        row.value,
      );
    } catch {
      // Ignore malformed values and retain the store default.
    }
  }

  const settings = {
    ...fallbackSettings,
    ...databaseSettings,
  };

  if (Object.keys(settings).length > 0) {
    writeFallbackSettings(settings);
  }

  return settings;
}

export function setPersistedSetting<K extends keyof PersistedSettings>(
  key: K,
  value: PersistedSettings[K],
) {
  const fallbackSettings = {
    ...readFallbackSettings(),
    [key]: value,
  };
  const database = getDatabaseSync();
  if (!database) {
    writeFallbackSettings(fallbackSettings);
    return;
  }

  database.runSync(
    `INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)`,
    [key, JSON.stringify(value), Date.now()],
  );
  writeFallbackSettings(fallbackSettings);
}

export function clearPersistedSettings() {
  const database = getDatabaseSync();
  database?.runSync("DELETE FROM settings");
  writeFallbackSettings({});
}
