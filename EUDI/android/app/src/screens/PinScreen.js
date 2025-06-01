import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';

export default function PinScreen({ navigation, route }) {
  const [pin, setPin] = useState('');
  const correctPin = '1234';

  const handleSubmit = () => {
    if (pin === correctPin) {
      navigation.replace('Home');
    } else {
      Alert.alert('Invalid PIN', 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter PIN for {route.params.phone}:</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />
      <Button title="Login" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  label: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
});
