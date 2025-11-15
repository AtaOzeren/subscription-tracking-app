import React, { useState, useRef } from 'react';
import { View, Animated, KeyboardAvoidingView, Platform } from 'react-native';
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
import SubscriptionDetailScreen from '../screens/SubscriptionDetailScreen/SubscriptionDetailScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import WelcomeScreen from '../screens/WelcomeScreen/WelcomeScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen/LanguageSelectionScreen';
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
        options={{ title: 'Subscription Details', headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

const OnboardingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeScreen, setActiveScreen] = useState<'main' | 'profile'>('main');
  const [tabBarHeight, setTabBarHeight] = useState(100);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const handleNavigateToProfile = () => {
    setActiveScreen('profile');
  };

  const handleBackToMain = () => {
    setActiveScreen('main');
  };

  const handleNavigateToSubscriptions = () => {
    setActiveTab('subscriptions');
  };

  const handleNavigateToAddSubscription = () => {
    setActiveTab('search');
  };

  const renderScreen = () => {
    if (activeScreen === 'profile') {
      return <ProfileScreen route={{ params: { onBack: handleBackToMain } }} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen 
          scrollY={scrollY} 
          tabBarHeight={tabBarHeight} 
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToSubscriptions={handleNavigateToSubscriptions}
          onNavigateToAddSubscription={handleNavigateToAddSubscription}
        />;
      case 'subscriptions':
        return <SubscriptionsScreen scrollY={scrollY} />;
      case 'statistics':
        return <StatisticsScreen scrollY={scrollY} onNavigateToProfile={handleNavigateToProfile} />;
      case 'search':
        return <SearchScreen scrollY={scrollY} />;
      default:
        return <HomeScreen 
          scrollY={scrollY} 
          tabBarHeight={tabBarHeight} 
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToSubscriptions={handleNavigateToSubscriptions}
          onNavigateToAddSubscription={handleNavigateToAddSubscription}
        />;
    }
  };

  const tabs = [
    {
      key: 'home',
      iconName: 'home',
      label: t('navigation.home'),
      onPress: () => setActiveTab('home'),
      isActive: activeTab === 'home',
    },
    {
      key: 'statistics',
      iconName: 'bar-chart',
      label: t('navigation.statistics'),
      onPress: () => setActiveTab('statistics'),
      isActive: activeTab === 'statistics',
    },
    {
      key: 'subscriptions',
      iconName: 'list',
      label: t('navigation.subscriptions'),
      onPress: () => setActiveTab('subscriptions'),
      isActive: activeTab === 'subscriptions',
    },
    {
      key: 'search',
      iconName: 'search',
      label: t('navigation.search'),
      onPress: () => setActiveTab('search'),
      isActive: activeTab === 'search',
    },
  ];

  return (
    <View className="flex-1" style={{ position: 'relative' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {renderScreen()}
      </KeyboardAvoidingView>
      {activeScreen === 'main' && (
        <CustomBottomTabBar 
          tabs={tabs} 
          scrollY={scrollY} 
          onLayout={setTabBarHeight}
        />
      )}
    </View>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, isFirstTimeUser } = useAuth();
  const { isLoading: languageLoading } = useLanguage();

  if (isLoading || languageLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isFirstTimeUser ? (
        <OnboardingNavigator />
      ) : isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;