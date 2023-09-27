import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';

const AuthStack = createStackNavigator(
  {
    Home: {screen: LoginScreen},
    Details: {screen: HomeScreen},
  },
  {
    initialRouteName: 'Home',
  },
);

// 최상단 네비게이터
const AppNavigator = createSwitchNavigator(
  {
    Auth: AuthStack,
  },
  {
    initialRouteName: 'Auth',
  },
);

export default createAppContainer(AppNavigator);
