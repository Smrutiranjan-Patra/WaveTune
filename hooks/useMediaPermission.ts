import * as MediaLibrary from "expo-media-library";

import { useEffect, useState } from "react";

export function useMediaPermission() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      setGranted(status === "granted");
    })();
  }, []);

  return granted;
}
