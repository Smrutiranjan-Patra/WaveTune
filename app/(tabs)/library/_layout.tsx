import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const { Navigator } = createMaterialTopTabNavigator();

export default function LibraryLayout() {
  const TopTabs = withLayoutContext(Navigator);

  const libraryTabs = [
    { name: "songs", label: "Songs" },
    { name: "albums", label: "Albums" },
    { name: "artists", label: "Artists" },
    { name: "genres", label: "Genres" },
    { name: "folders", label: "Folders" },
  ];

  return (
    <TopTabs
      id={"library-tabs"}
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarShowIcon: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#6363ff",
          height: 3,
          borderRadius: 2,
        },
        tabBarLabelStyle: {
          textTransform: "none",
          fontSize: 14,
          fontWeight: "600",
        },
        tabBarActiveTintColor: "#6363ff",
        tabBarInactiveTintColor: "#666666",
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
  );
}
