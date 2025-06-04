import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define the stack param types inline
type RootStackParamList = {
  Home: undefined;
  'Verify VP': undefined;
  Hello: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button
        title="Verify a VP"
        onPress={() => navigation.navigate('Verify VP')}
      />
      <View style={styles.spacer} />
      <Button
        title="Go to Hello Page"
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
