// App.js

import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './android/app/src/screens/LoginScreen';
import PinScreen from './android/app/src/screens/PinScreen';
import HomeScreen from './android/app/src/screens/HomeScreen';
import VcListScreen from './android/app/src/screens/VcListScreen';
import ScanScreen from './android/app/src/screens/ScanScreen';
import VcDetailScreen from './android/app/src/screens/VcDetailScreen';
import VcQrScreen from './android/app/src/screens/VcQrScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PIN" component={PinScreen} />
        <Stack.Screen name="VcDetailScreen" component={VcDetailScreen} />
        <Stack.Screen name="VcQRScreen" component={VcQrScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="VCs" component={VcListScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
