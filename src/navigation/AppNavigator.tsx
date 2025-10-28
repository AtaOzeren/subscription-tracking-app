import React, { useState, useRef } from 'react';
import { View, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '../screens/LoadingScreen/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen/SubscriptionsScreen';
import StatisticsScreen from '../screens/StatisticsScreen/StatisticsScreen';
import SearchScreen from '../screens/SearchScreen/SearchScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen/AddSubscriptionScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import SubscriptionDetailScreen from '../screens/SubscriptionDetailScreen/SubscriptionDetailScreen';
import CustomBottomTabBar from '../components/common/CustomBottomTabBar';

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

const MainNavigator = () => {
  const [activeTab, setActiveTab] = useState('home');
  const scrollY = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen scrollY={scrollY} />;
      case 'subscriptions':
        return <SubscriptionsScreen scrollY={scrollY} />;
      case 'statistics':
        return <StatisticsScreen scrollY={scrollY} />;
      case 'search':
        return <SearchScreen scrollY={scrollY} />;
      default:
        return <HomeScreen scrollY={scrollY} />;
    }
  };

  const tabs = [
    {
      key: 'home',
      icon: '◉',
      label: t('navigation.home'),
      onPress: () => setActiveTab('home'),
      isActive: activeTab === 'home',
    },
    {
      key: 'subscriptions',
      icon: '▭',
      label: t('navigation.subscriptions'),
      onPress: () => setActiveTab('subscriptions'),
      isActive: activeTab === 'subscriptions',
    },
    {
      key: 'statistics',
      icon: '◧',
      label: t('navigation.statistics'),
      onPress: () => setActiveTab('statistics'),
      isActive: activeTab === 'statistics',
    },
    {
      key: 'search',
      icon: '◎',
      label: t('navigation.search'),
      onPress: () => setActiveTab('search'),
      isActive: activeTab === 'search',
    },
  ];

  return (
    <View className="flex-1">
      {renderScreen()}
      <CustomBottomTabBar tabs={tabs} scrollY={scrollY} />
    </View>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoading: languageLoading } = useLanguage();

  if (isLoading || languageLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;