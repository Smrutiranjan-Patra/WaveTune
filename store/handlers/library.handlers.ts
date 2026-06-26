import { initializeLibrary } from "../../services/library/library.service";

const loadLibraryData = async (set, get) => {
  set({ loading: true });

  try {
    const library = await initializeLibrary();

    set({
      ...library,
      initialized: true,
      loading: false,
    });
  } catch {
    set({
      initialized: true,
      loading: false,
    });
  }
};

export { loadLibraryData };
