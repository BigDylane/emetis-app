import { Redirect } from 'expo-router';

export default function PublicLoginTab() {
  return <Redirect href="/(auth)/login" />;
}
