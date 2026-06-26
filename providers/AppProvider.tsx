// providers/AppProvider.tsx

import { useEffect } from "react";
import { useLibraryStore } from "../store/library.store";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadLibrary = useLibraryStore((state) => state.loadLibrary);

  useEffect(() => {
    loadLibrary();
  }, []);

  return children;
}
