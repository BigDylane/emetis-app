import { Tabs } from 'expo-router';

export default function TravelerTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="search" options={{ title: 'Recherche' }} />
    </Tabs>
  );
}
