import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function VcQrScreen({ route }) {
  const { presentationJson } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verifiable Presentation</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={JSON.stringify(presentationJson)}
          size={270}
        />
      </View>

      <Text style={styles.meta}>QR contains full W3C Verifiable Presentation with ZK-style proof.</Text>

      <View style={styles.debugBox}>
        <Text style={styles.debugText}>Holder: {presentationJson.holder}</Text>
        <Text style={styles.debugText}>Challenge: {presentationJson.proof?.challenge}</Text>
        <Text style={styles.debugText}>Signature: {presentationJson.proof?.jws?.slice(0, 32)}...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#000' },
  qrContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  meta: { marginTop: 20, fontStyle: 'italic', fontSize: 13, color: '#000', textAlign: 'center' },
  debugBox: {
    marginTop: 30,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
  },
});