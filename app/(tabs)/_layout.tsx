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
          borderRadius: 12,
          marginHorizontal: 2,
          paddingHorizontal: 3,
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          lineHeight: 14,
          margin: 0,
        },
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderRadius: 18,
          borderTopWidth: 1,
          bottom: 12,
          height: 72,
          left: 12,
          paddingBottom: 8,
          paddingHorizontal: 10,
          paddingTop: 8,
          position: "absolute",
          right: 12,
          ...softShadow(theme.isDark, "high"),
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
