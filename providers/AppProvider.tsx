// providers/AppProvider.tsx

import { useEffect } from "react";
import { useLibraryStore } from "../store/library.store";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadLibraryData = useLibraryStore((state) => state.loadLibraryData);

  useEffect(() => {
    loadLibraryData();
  }, []);

  return children;
}
