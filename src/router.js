import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Button, Text} from 'react-native';
import STTScreen from './component/STT';
import TranslateScreen from './component/Translate';

const Stack = createNativeStackNavigator();

const Router = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Speech To Text"
          component={STTScreen}
          options={({navigation, route}) => ({
            // Add a placeholder button without the `onPress` to avoid flicker
            headerRight: () => <Button title="번역" />,
          })}
        />
        <Stack.Screen
          name="Text Translator"
          component={TranslateScreen}
          options={({navigation, route}) => ({
            // Add a placeholder button without the `onPress` to avoid flicker
            headerRight: () => (
              <Button
                title="홈으로"
                onPress={() => navigation.navigate('Speech To Text')}
              />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;
