import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function VcQrScreen({ route }) {
  const { presentationJson } = route.params;

  const [presentationData, setPresentationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function resolvePresentation() {
      try {
        // Se for função, chama para obter o valor
        let data;
        if (typeof presentationJson === 'function') {
          data = await presentationJson();
        } else if (presentationJson && typeof presentationJson.then === 'function') {
          // Se for Promise, aguarda resolução
          data = await presentationJson;
        } else {
          // Já é o objeto JSON
          data = presentationJson;
        }
        setPresentationData(data);
      } catch (err) {
        console.error('Erro ao obter apresentação:', err);
      } finally {
        setLoading(false);
      }
    }

    resolvePresentation();
  }, [presentationJson]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10, color: '#000' }}>Loading presentation...</Text>
      </View>
    );
  }

  if (!presentationData) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: '#000' }}>No presentation data available.</Text>
      </View>
    );
  }

  console.log('📜 Presentation JSON:', JSON.stringify(presentationData, null, 2));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Verifiable Presentation</Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={JSON.stringify(presentationData)}
          size={270}
        />
      </View>

      <Text style={styles.meta}>QR contains full W3C Verifiable Presentation.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#000' },
  qrContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
  meta: { marginTop: 20, fontStyle: 'italic', fontSize: 13, color: '#000', textAlign: 'center' },
});