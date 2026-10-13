import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '@/auth/sessionStore';
import { Header } from '@/components/ui/Header';

export default function TravelerLayout() {
  const user = useSessionStore((state) => state.user);

  if (!user || user.role !== 'traveler') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ header: () => <Header /> }} />;
}
