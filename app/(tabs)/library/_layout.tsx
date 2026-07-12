import { withLayoutContext } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "../../../components/DesignSystem";

const { Navigator } = createMaterialTopTabNavigator();

const libraryTabs = [
  { name: "songs", label: "Songs" },
  { name: "artists", label: "Artists" },
  { name: "albums", label: "Albums" },
  { name: "genres", label: "Genres" },
  { name: "folders", label: "Folders" },
];

function LibraryTabBar({ navigation, state }: { navigation: any; state: any }) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: theme.background,
        paddingBottom: 6,
        paddingHorizontal: 18,
        paddingTop: 8,
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          height: 34,
        }}
      >
        {state.routes.map(
          (route: { key: string; name: string }, index: number) => {
            const focused = state.index === index;
            const tab = libraryTabs.find((item) => item.name === route.name);

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                key={route.key}
                onPress={() => {
                  const event = navigation.emit({
                    canPreventDefault: true,
                    target: route.key,
                    type: "tabPress",
                  });

                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={{
                  alignItems: "center",
                  flex: 1,
                  height: 34,
                  justifyContent: "center",
                  minWidth: 0,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: focused
                      ? theme.isDark
                        ? "#2B2853"
                        : "#ECEAFF"
                      : "transparent",
                    borderRadius: 7,
                    justifyContent: "center",
                    minHeight: 28,
                    paddingHorizontal: 9,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      color: focused ? theme.accent : theme.secondary,
                      fontSize: 11,
                      fontWeight: focused ? "800" : "600",
                    }}
                  >
                    {tab?.label ?? route.name}
                  </Text>
                </View>
              </Pressable>
            );
          },
        )}
      </View>
    </View>
  );
}

export default function LibraryLayout() {
  const theme = useAppTheme();
  const TopTabs = withLayoutContext(Navigator);

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
        tabBar={(props) => <LibraryTabBar {...props} />}
        screenOptions={{
          lazy: true,
          swipeEnabled: true,
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
