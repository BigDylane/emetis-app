import { View, Text, StyleSheet } from 'react-native';

export function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoris</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
