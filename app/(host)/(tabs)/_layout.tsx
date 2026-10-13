import { Tabs } from 'expo-router';

export default function HostTabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="listings" options={{ title: 'Annonces' }} />
    </Tabs>
  );
}
