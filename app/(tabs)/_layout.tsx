import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const tabs = [
    {
      name: "home",
      label: "Home",
      icon: "home-outline",
    },

    {
      name: "playlist",
      label: "Playlists",
      icon: "list-outline",
    },

    {
      name: "search",
      label: "Search",
      icon: "search-outline",
    },

    {
      name: "library",
      label: "Library",
      icon: "musical-notes-outline",
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
        tabBarActiveTintColor: "#6363ff",
        tabBarInactiveTintColor: "#1E1E1E",
      }}
    >
      {tabs.map(({ name, label, icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarLabel: label,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
