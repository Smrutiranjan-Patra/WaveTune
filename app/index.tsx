import { Redirect } from "expo-router";

import { useSettingsStore } from "../store/settings.store";

const Index = () => {
  const userName = useSettingsStore((state) => state.userName);

  if (!userName) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/home" />;
};

export default Index;
