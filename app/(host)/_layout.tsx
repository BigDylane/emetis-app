import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '@/auth/sessionStore';

export default function HostLayout() {
  const user = useSessionStore((state) => state.user);

  if (!user || user.role !== 'host') {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack />;
}
