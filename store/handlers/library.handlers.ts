import { initializeLibrary } from "../../services/library/library.service";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load your music library.";
};

const loadLibraryData = async (set, get) => {
  set({ error: null, loading: true });

  try {
    const library = await initializeLibrary();

    set({
      ...library,
      error: null,
      initialized: true,
      lastScanCount: library.songs.length,
      loading: false,
    });
  } catch (error) {
    set({
      error: getErrorMessage(error),
      initialized: true,
      lastScanCount: 0,
      loading: false,
    });
  }
};

export { loadLibraryData };
