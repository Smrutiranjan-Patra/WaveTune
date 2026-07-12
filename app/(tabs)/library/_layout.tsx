import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Text, View } from "react-native";

import { useAppTheme } from "../../../components/DesignSystem";

const { Navigator } = createMaterialTopTabNavigator();

export default function LibraryLayout() {
  const theme = useAppTheme();
  const TopTabs = withLayoutContext(Navigator);

  const libraryTabs = [
    { name: "songs", label: "Songs" },
    { name: "albums", label: "Albums" },
    { name: "artists", label: "Artists" },
    { name: "genres", label: "Genres" },
    { name: "folders", label: "Folders" },
  ];

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <Text
        style={{
          color: theme.primary,
          fontSize: 24,
          fontWeight: "900",
          paddingHorizontal: 22,
          paddingTop: 10,
        }}
      >
        Library
      </Text>
    <TopTabs
      id={"library-tabs"}
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarShowIcon: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          elevation: 0,
          paddingHorizontal: 14,
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.accent,
          borderRadius: 8,
          height: 28,
        },
        tabBarItemStyle: {
          minHeight: 36,
          paddingHorizontal: 0,
          width: "auto",
        },
        tabBarLabelStyle: {
          textTransform: "none",
          fontSize: 12,
          fontWeight: "800",
          marginHorizontal: 10,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: theme.secondary,
      }}
    >
      {libraryTabs.map((tab) => (
        <TopTabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
          }}
        />
      ))}
    </TopTabs>
    </View>
  );
}
