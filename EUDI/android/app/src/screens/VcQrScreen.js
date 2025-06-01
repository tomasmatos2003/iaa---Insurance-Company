import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function VcQrScreen({ route }) {
  const { vcMinimal } = route.params;

  const payload = {
    type: vcMinimal.type,
    policyNumber: vcMinimal.policyNumber,
    coverage: vcMinimal.coverage,
    validUntil: vcMinimal.validUntil,
    zkProof: vcMinimal.zkProof, // ✅ Use actual zkProof passed from previous screen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Zero-Knowledge Proof of Credential</Text>
      <QRCode
        value={JSON.stringify(payload)}
        size={250}
      />
      <Text style={styles.meta}>QR contains ZK proof of VC possession.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  meta: { marginTop: 20, fontStyle: 'italic', fontSize: 13, color: '#777' },
});
