import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/auth/sessionStore';
import { router } from 'expo-router';

export default function LoginScreen() {
  const setUser = useSessionStore((state) => state.setUser);

  function loginAsTraveler() {
    setUser({ id: '1', email: 'traveler@emetis.net', name: 'Traveler Demo', role: 'traveler' });
    router.replace('/(traveler)/(tabs)/search');
  }

  function loginAsHost() {
    setUser({ id: '2', email: 'host@emetis.net', name: 'Host Demo', role: 'host' });
    router.replace('/(host)/(tabs)/listings');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <Button label="Se connecter comme traveler" onPress={loginAsTraveler} />
      <Button label="Se connecter comme host" onPress={loginAsHost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
});
