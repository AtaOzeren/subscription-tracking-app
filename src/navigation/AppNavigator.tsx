import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../screens/LoadingScreen/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen/AddSubscriptionScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import SubscriptionDetailScreen from '../screens/SubscriptionDetailScreen/SubscriptionDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubscriptionDetail"
        component={SubscriptionDetailScreen}
        options={{ title: 'Subscription Details' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#4ECDC4',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: () => <Text>🏠</Text>
            }}
          />
          <Tab.Screen
            name="Add"
            component={AddSubscriptionScreen}
            options={{
              tabBarLabel: 'Add',
              tabBarIcon: () => <Text>➕</Text>
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarLabel: 'Settings',
              tabBarIcon: () => <Text>⚙️</Text>
            }}
          />
        </Tab.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;