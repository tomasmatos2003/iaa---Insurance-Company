import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './android/app/src/screens/HomeScreen';
import VerifyVPScreen from './android/app/src/screens/VerifyVPScreen';
import HelloScreen from './android/app/src/screens/HelloScreen';

type RootStackParamList = {
  Home: undefined;
  'Verify VP': undefined;
  Hello: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
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

export default App;
