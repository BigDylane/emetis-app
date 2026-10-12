import { Tabs } from 'expo-router';

export default function HostTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="listings" options={{ title: 'Annonces' }} />
    </Tabs>
  );
}
