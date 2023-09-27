import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './component/Home';
import Details from './component/Details';

const Stack = createNativeStackNavigator();

const Router = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Speech To Text" component={Home} />
        <Stack.Screen name="Translator Text" component={Details} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;
