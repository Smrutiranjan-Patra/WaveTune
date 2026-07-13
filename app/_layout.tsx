// app/_layout.tsx
import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../components/DesignSystem";
import FloatingSearchButton from "../components/FloatingSearchButton";
import Header from "../components/Header";
import MiniPlayer from "../components/MiniPlayer";
import "../global.css";
import AppProvider from "../providers/AppProvider";
import { useSettingsStore } from "../store/settings.store";

function AppShell() {
  const theme = useAppTheme();
  const [miniPlayerHidden, setMiniPlayerHidden] = useState(false);
  const floatingControlsHidden = useSettingsStore(
    (state) => state.floatingControlsHidden,
  );
  const setFloatingControlsHidden = useSettingsStore(
    (state) => state.setFloatingControlsHidden,
  );
  const pathname = usePathname();
  const routeParams = useGlobalSearchParams<{ id?: string; mode?: string }>();
  const isPlayerScreen = pathname === "/player";
  const isOnboardingScreen = pathname === "/onboarding";
  const isPlaylistScreen = pathname.startsWith("/playlist/");
  const isPlaylistEditor =
    isPlaylistScreen &&
    (routeParams.id === "new" || routeParams.mode === "edit");
  const isPrivacyPolicyScreen = pathname === "/privacy-policy";
  const isSearchScreen = pathname === "/search";
  const shouldShowHeader = pathname === "/" || pathname === "/home";
  const shouldShowFloatingControls =
    !isPlayerScreen &&
    !isOnboardingScreen &&
    !isPlaylistEditor &&
    !isPrivacyPolicyScreen &&
    !isSearchScreen;
  const shouldShowMiniPlayer =
    shouldShowFloatingControls && !isPlaylistScreen;

  useEffect(() => {
    if (!shouldShowFloatingControls || floatingControlsHidden) {
      return;
    }

    const timer = setTimeout(() => {
      setFloatingControlsHidden(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    floatingControlsHidden,
    setFloatingControlsHidden,
    shouldShowFloatingControls,
  ]);

  return (
    <SafeAreaView
      style={{ backgroundColor: theme.background, flex: 1 }}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        animated
        backgroundColor={theme.background}
        style={theme.isDark ? "light" : "dark"}
      />
      {!isPlayerScreen && shouldShowHeader ? <Header /> : null}
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="player"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
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
        {shouldShowMiniPlayer ? (
          <MiniPlayer
            hidden={miniPlayerHidden}
            onSwipeLeft={() => setMiniPlayerHidden(true)}
            reserveSearchSpace={!floatingControlsHidden}
          />
        ) : null}
        {shouldShowFloatingControls ? (
          <FloatingSearchButton
            hidden={floatingControlsHidden}
            miniPlayerHidden={shouldShowMiniPlayer && miniPlayerHidden}
            onHide={() => setFloatingControlsHidden(true)}
            onShowMiniPlayer={() => setMiniPlayerHidden(false)}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
