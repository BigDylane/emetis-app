import { Stack } from 'expo-router';
import { Header } from '@/components/ui/Header';

export default function AuthLayout() {
  return <Stack screenOptions={{ header: () => <Header /> }} />;
}
