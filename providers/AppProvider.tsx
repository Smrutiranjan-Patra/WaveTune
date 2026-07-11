// providers/AppProvider.tsx

import { useEffect } from "react";
import { useLibraryStore } from "../store/library.store";
import { usePlayerStore } from "../store/player.store";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cleanupPlayer = usePlayerStore((state) => state.cleanupPlayer);
  const loadLibraryData = useLibraryStore((state) => state.loadLibraryData);
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);

  useEffect(() => {
    void initializePlayer();
    loadLibraryData();

    return () => {
      void cleanupPlayer();
    };
  }, [cleanupPlayer, initializePlayer, loadLibraryData]);

  return children;
}
