// App.js

import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import HomeScreen from './android/app/src/screens/HomeScreen';
import VerifyVPScreen from './android/app/src/screens/VerifyVPScreen';
import HelloScreen from './android/app/src/screens/HelloScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Verify VP" component={VerifyVPScreen} />
        <Stack.Screen name="Hello" component={HelloScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
