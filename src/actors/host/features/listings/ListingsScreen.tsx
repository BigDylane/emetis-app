import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useListings } from './useListings';

export function ListingsScreen() {
  const { data, isLoading, error } = useListings();

  if (isLoading) {
    return <ActivityIndicator style={styles.container} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Erreur de chargement des annonces</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes annonces (host)</Text>
      {data?.map((listing) => (
        <Text key={listing.id}>{listing.title}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});
