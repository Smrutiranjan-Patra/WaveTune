import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

import { softShadow, useAppTheme } from "../../components/DesignSystem";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function TabLayout() {
  const theme = useAppTheme();
  const tabs: { name: string; label: string; icon: IconName }[] = [
    {
      name: "home",
      label: "Home",
      icon: "home-outline",
    },
    {
      name: "library",
      label: "Library",
      icon: "musical-notes-outline",
    },
    {
      name: "playlist",
      label: "Playlists",
      icon: "list-outline",
    },
    {
      name: "settings",
      label: "Settings",
      icon: "settings-outline",
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
        tabBarStyle: {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderRadius: 24,
          borderTopWidth: 1,
          bottom: 10,
          height: 64,
          left: 14,
          paddingBottom: 8,
          paddingTop: 7,
          position: "absolute",
          right: 14,
          ...softShadow(theme.isDark, "high"),
        },
      }}
    >
      {tabs.map(({ name, label, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarLabel: label,
            tabBarIcon: ({ color, focused }) => {
              const resolvedIcon =
                focused && icon.endsWith("-outline")
                  ? (icon.replace("-outline", "") as IconName)
                  : icon;

              return (
                <Ionicons
                  name={resolvedIcon}
                  color={color}
                  size={focused ? 23 : 21}
                />
              );
            },
          }}
        />
      ))}
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}
