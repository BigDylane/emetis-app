import { Tabs } from 'expo-router';

export default function TravelerTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="search" options={{ title: 'Recherche' }} />
    </Tabs>
  );
}
