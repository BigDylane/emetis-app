import { Stack } from 'expo-router';
import { Header } from '@/components/ui/Header';

export default function PublicLayout() {
  return <Stack screenOptions={{ header: () => <Header /> }} />;
}
