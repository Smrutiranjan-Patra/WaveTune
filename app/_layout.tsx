// app/_layout.tsx
import { Stack, usePathname } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../components/DesignSystem";
import Header from "../components/Header";
import MiniPlayer from "../components/MiniPlayer";
import "../global.css";
import AppProvider from "../providers/AppProvider";

function AppShell() {
  const theme = useAppTheme();
  const pathname = usePathname();
  const isPlayerScreen = pathname === "/player";
  const isOnboardingScreen = pathname === "/onboarding";
  const shouldShowHeader = pathname === "/" || pathname === "/home";
  const shouldShowMiniPlayer = !isPlayerScreen && !isOnboardingScreen;

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background, flex: 1 }}
      edges={["top", "left", "right"]}
    >
      {!isPlayerScreen && shouldShowHeader ? <Header /> : null}
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="player"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="song/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="collection/[type]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="library-group/[type]"
            options={{ headerShown: false }}
          />
        </Stack>
        {shouldShowMiniPlayer ? <MiniPlayer /> : null}
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
