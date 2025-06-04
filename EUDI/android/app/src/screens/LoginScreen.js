import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Mobile Number:</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="e.g. +1234567890"
        placeholderTextColor="#666"
        value={phone}
        onChangeText={setPhone}
      />
      <Button
        title="Next"
        onPress={() => navigation.navigate('PIN', { phone })}
        disabled={phone.length < 8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#000', // texto preto
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
    color: '#000', // texto inserido em preto
  },
});