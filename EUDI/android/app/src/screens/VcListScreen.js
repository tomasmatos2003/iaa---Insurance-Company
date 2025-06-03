import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStoredVcs } from '../utils/storage';
import { ec as EC } from 'elliptic'; // ✅ Avoids eddsa issues
import CryptoJS from 'crypto-js';

const ec = new EC('secp256k1');

// Hash function using crypto-js
const SHA256 = (data) => CryptoJS.SHA256(data).toString();

// Generate ECC keypair (simulate holder identity)
const getZkKeyPair = () => ec.genKeyPair();

const generateZkProof = (keyPair, challenge) => {
  const pubKey = keyPair.getPublic().encode('hex'); // Safe serialized public key
  const hash = SHA256(challenge);
  const signature = keyPair.sign(hash);

  return {
    publicKey: pubKey,
    challenge,
    signature: {
      r: signature.r.toString(16),
      s: signature.s.toString(16),
    },
  };
};

export default function VcListScreen() {
  const [vcs, setVcs] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchVcs = async () => {
      const data = await getStoredVcs();
      setVcs(data);
    };
    fetchVcs();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Stored Verifiable Credentials</Text>

      {vcs.map((vc, index) => {
        const subject = vc.credentialSubject || {};
        const holder = subject.holder || {};
        const vehicle = subject.vehicle || {};
        const coverage = subject.coverage || {};
        const issuer = vc.issuer?.name || 'Unknown Issuer';

        return (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{vc.type?.[1] || 'Credential'}</Text>
            <Text style={styles.label}>Issuer:</Text>
            <Text style={styles.value}>{issuer}</Text>

            <Text style={styles.label}>Holder:</Text>
            <Text style={styles.value}>
              {holder.givenName} {holder.familyName}
            </Text>

            <Text style={styles.label}>Policy #:</Text>
            <Text style={styles.value}>{subject.policyNumber}</Text>

            <Text style={styles.label}>Vehicle:</Text>
            <Text style={styles.value}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>

            <Text style={styles.label}>Coverage:</Text>
            <Text style={styles.value}>
              {coverage.type} — €{Number(coverage.coverageAmount).toLocaleString()}
            </Text>

            <Text style={styles.meta}>Valid from {coverage.startDate} to {coverage.endDate}</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  const keyPair = getZkKeyPair();
                  const challenge = `zk-challenge-${Date.now()}`;
                  const zkProof = generateZkProof(keyPair, challenge);

                  navigation.navigate('VcQRScreen', {
                    vcMinimal: {
                      type: vc.type?.[1],
                      policyNumber: subject.policyNumber,
                      coverage: coverage.type,
                      validUntil: vc.expirationDate,
                      zkProof,
                    },
                  });
                }}
              >
                <Text style={styles.buttonText}>View QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  navigation.navigate('VcDetailScreen', {
                    vcMinimal: {
                      '@context': vc['@context'],
                      type: vc.type,
                      issuer: vc.issuer,
                      issuanceDate: vc.issuanceDate,
                      expirationDate: vc.expirationDate,
                      credentialSubject: vc.credentialSubject,
                    },
                  })
                }
              >
                <Text style={styles.buttonText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 6,
    color: '#555',
  },
  value: {
    marginBottom: 4,
    color: '#000',
  },
  meta: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#777',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
