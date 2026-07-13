import { getDatabase } from "./database.service";
import { clearPersistedSettings } from "./settings.repository";

export async function resetPersistedAppData() {
  const database = await getDatabase();

  if (database) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        DELETE FROM playlist_songs;
        DELETE FROM playlists;
        DELETE FROM favorite_songs;
        DELETE FROM playback_history;
        DELETE FROM songs;
        DELETE FROM app_metadata;
        DELETE FROM settings;
      `);
    });
  }

  clearPersistedSettings();
}
