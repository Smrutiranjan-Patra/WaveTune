import { initializeLibrary } from "../../services/library/library.service";

let activeLibraryLoad: Promise<void> | null = null;
let libraryRefreshQueued = false;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load your music library.";
};

const loadLibraryData = async (set, get) => {
  if (activeLibraryLoad) {
    libraryRefreshQueued = true;
    return activeLibraryLoad;
  }

  set({ error: null, loading: true });

  activeLibraryLoad = (async () => {
    try {
      do {
        libraryRefreshQueued = false;
        const library = await initializeLibrary();

        set({
          ...library,
          error: null,
          initialized: true,
          lastScanCount: library.songs.length,
        });
      } while (libraryRefreshQueued);
    } catch (error) {
      set({
        error: getErrorMessage(error),
        initialized: true,
        lastScanCount: 0,
      });
    } finally {
      activeLibraryLoad = null;
      set({ loading: false });
    }
  })();

  return activeLibraryLoad;
};

export { loadLibraryData };
