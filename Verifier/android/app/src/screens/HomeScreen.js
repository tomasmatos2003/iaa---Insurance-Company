import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button
        title="Verify a VP"
        onPress={() => navigation.navigate('Verify VP')}
      />
      <View style={styles.spacer} />
      <Button
        title="Account"
        onPress={() => navigation.navigate('Hello')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  spacer: {
    height: 20,
  },
});

export default HomeScreen;
