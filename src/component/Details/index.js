import React from 'react';
import {View, Text} from 'react-native';
import {Icon} from '@rneui/themed';

const Details = ({navigation}) => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Hello World2</Text>
      <Icon
        name="mic"
        color="#517fa4"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
};

export default Details;
