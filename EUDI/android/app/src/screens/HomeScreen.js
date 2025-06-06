import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { storeVc } from '../utils/storage';

export default function HomeScreen({ navigation }) {


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your Wallet</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VCs')}>
        <Text style={styles.buttonText}>📄 View Your VCs</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Scan')}>
        <Text style={styles.buttonText}>📷 Scan New VC</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Requests')}>
        <Text style={styles.buttonText}>📝 Scan Request VCs</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.button} onPress={handleUpload}>
        <Text style={styles.buttonText}>⬆️ Upload Example VC</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#000', // texto preto
  },
  button: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#000', // já estava correto
  },
});