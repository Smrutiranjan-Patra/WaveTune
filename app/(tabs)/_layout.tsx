import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { View } from "react-native";

import { softShadow, useAppTheme } from "../../components/DesignSystem";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabs: { name: string; label: string; icon: IconName }[] = [
  { name: "home", label: "Home", icon: "home-outline" },
  { name: "library", label: "Library", icon: "musical-notes-outline" },
  { name: "playlist", label: "Playlists", icon: "list-outline" },
  { name: "settings", label: "Settings", icon: "settings-outline" },
];

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarIconStyle: {
          height: 25,
          margin: 0,
        },
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarItemStyle: {
          borderRadius: 16,
          height: 52,
          justifyContent: "center",
          marginHorizontal: 2,
          paddingHorizontal: 4,
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          lineHeight: 14,
          margin: 0,
        },
        tabBarBackground: () => (
          <View
            pointerEvents="none"
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderRadius: 24,
              borderWidth: 1,
              bottom: 0,
              left: 17,
              position: "absolute",
              right: 17,
              top: 0,
              ...softShadow(theme.isDark, "high"),
            }}
          />
        ),
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          bottom: 18,
          elevation: 0,
          height: 70,
          paddingBottom: 8,
          paddingHorizontal: 38,
          paddingTop: 8,
          position: "absolute",
        },
      }}
    >
      {tabs.map(({ icon, label, name }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ color, focused }) => {
              const resolvedIcon =
                focused && icon.endsWith("-outline")
                  ? (icon.replace("-outline", "") as IconName)
                  : icon;

              return (
                <View
                  style={{
                    alignItems: "center",
                    height: 25,
                    justifyContent: "center",
                    width: 30,
                  }}
                >
                  <Ionicons
                    color={color}
                    name={resolvedIcon}
                    size={focused ? 22 : 21}
                  />
                </View>
              );
            },
            tabBarLabel: label,
            title: label,
          }}
        />
      ))}
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
