import { View, Text, StyleSheet } from 'react-native';

export function ListingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes annonces (host)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
