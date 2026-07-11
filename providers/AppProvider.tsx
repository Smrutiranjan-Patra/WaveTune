// providers/AppProvider.tsx

import { useEffect } from "react";
import { useLibraryStore } from "../store/library.store";
import { usePlayerStore } from "../store/player.store";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadLibraryData = useLibraryStore((state) => state.loadLibraryData);
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);

  useEffect(() => {
    initializePlayer();
    loadLibraryData();
  }, [initializePlayer, loadLibraryData]);

  return children;
}
