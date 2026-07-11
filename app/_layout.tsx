// app/_layout.tsx
import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import MiniPlayer from "../components/MiniPlayer";
import "../global.css";
import AppProvider from "../providers/AppProvider";

export default function RootLayout() {
  const pathname = usePathname();
  const isPlayerScreen = pathname === "/player";

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <AppProvider>
        {!isPlayerScreen ? <Header /> : null}
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="player"
              options={{ headerShown: false, presentation: "modal" }}
            />
          </Stack>
          <MiniPlayer />
        </View>
      </AppProvider>
    </SafeAreaView>
  );
}
