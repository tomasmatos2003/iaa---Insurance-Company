import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStoredVcs } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signPresentation, HOLDER_DID } from '../utils/holder';

export default function VcListScreen() {
  const [vcs, setVcs] = useState([]);
  const navigation = useNavigation();

const getStoredVcs = async () => {
  const allKeys = await AsyncStorage.getAllKeys();
  const vcKeys = allKeys.filter(key => key.startsWith('vc_'));
  const vcItems = await AsyncStorage.multiGet(vcKeys);

  return vcItems.map(([_, value]) => JSON.parse(value));
};

  useEffect(() => {
    const fetchVcs = async () => {
      const data = await getStoredVcs();
      setVcs(data);
    };
    fetchVcs();
  }, []);

const deleteAllVcs = async () => {
  await AsyncStorage.clear();
  setVcs([]);
};

  const deleteVc = async (indexToDelete) => {
    const keys = await AsyncStorage.getAllKeys();
    const vcKeys = keys.filter((k) => k.startsWith('vc_'));

    const keyToDelete = vcKeys[indexToDelete];
    if (keyToDelete) {
      await AsyncStorage.removeItem(keyToDelete);
      const updatedVcs = vcs.filter((_, i) => i !== indexToDelete);
      setVcs(updatedVcs);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Stored Verifiable Credentials</Text>

      {vcs.map((vc, index) => {
        const subject = vc.credentialSubject || {};
        const owner = subject.owner || {};
        const engine = subject.engine || {};
        const vehicleCategory = subject.vehicleCategory || {};

        return (
          <View key={index} style={styles.card}>
  <Text style={styles.cardTitle}>{vc.type?.[1] || 'Credential'}</Text>

  <View style={styles.buttonContainer}>
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        const challenge = `challenge-${Date.now()}`;
        const domain = 'https://example.com/';
        const presentation = {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          holder: HOLDER_DID,
          verifiableCredential: [vc],
        };
        const fullVP = signPresentation(vc, challenge, domain);
        navigation.navigate('VcQRScreen', {
          presentationJson: fullVP,
        });
      }}
    >
      <Text style={styles.buttonText}>Show VP</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.button, { backgroundColor: '#FF3B30' }]}
      onPress={() => deleteVc(index)}
    >
      <Text style={styles.buttonText}>Delete</Text>
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
            proof: vc.proof,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
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
    color: '#000',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 6,
    color: '#000',
  },
  value: {
    marginBottom: 4,
    color: '#000',
  },
  meta: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#000',
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
