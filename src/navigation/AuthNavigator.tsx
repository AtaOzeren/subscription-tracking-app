import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen/RegisterScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen/LanguageSelectionScreen';
import { useLanguage } from '../contexts/LanguageContext';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  const { isFirstTime } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isFirstTime ? 'LanguageSelection' : 'Login'}
    >
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;