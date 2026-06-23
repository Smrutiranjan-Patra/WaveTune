// app/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <Header />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}
