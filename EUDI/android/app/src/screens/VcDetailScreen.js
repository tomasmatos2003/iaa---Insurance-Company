import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function VcDetailScreen({ route }) {
  const { vcMinimal } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>VC Full Details</Text>
      <Text selectable style={styles.json}>
        {JSON.stringify(vcMinimal, null, 2)}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  json: { fontFamily: 'monospace', fontSize: 14 },
});
