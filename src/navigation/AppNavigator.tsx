import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { storageService } from '../services/storageService';
import LoadingScreen from '../screens/LoadingScreen/LoadingScreen';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen/SubscriptionsScreen';
import StatisticsScreen from '../screens/StatisticsScreen/StatisticsScreen';
import SearchScreen from '../screens/SearchScreen/SearchScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen/AddSubscriptionScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import SubscriptionDetailScreen from '../screens/SubscriptionDetailScreen/SubscriptionDetailScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import WelcomeScreen from '../screens/WelcomeScreen/WelcomeScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen/LanguageSelectionScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen/ProfileSetupScreen';
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
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
};

const MainNavigator = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [tabBarHeight, setTabBarHeight] = useState(100);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen scrollY={scrollY} tabBarHeight={tabBarHeight} />;
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
      iconName: 'home',
      label: t('navigation.home'),
      onPress: () => setActiveTab('home'),
      isActive: activeTab === 'home',
    },
    {
      key: 'subscriptions',
      iconName: 'list',
      label: t('navigation.subscriptions'),
      onPress: () => setActiveTab('subscriptions'),
      isActive: activeTab === 'subscriptions',
    },
    {
      key: 'statistics',
      iconName: 'bar-chart',
      label: t('navigation.statistics'),
      onPress: () => setActiveTab('statistics'),
      isActive: activeTab === 'statistics',
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
      <CustomBottomTabBar 
        tabs={tabs} 
        scrollY={scrollY} 
        onLayout={setTabBarHeight}
      />
    </View>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading, isFirstTimeUser } = useAuth();
  const { isLoading: languageLoading } = useLanguage();
  const [needsProfileSetup, setNeedsProfileSetup] = React.useState(false);

  useEffect(() => {
    const checkProfileSetup = async () => {
      if (isAuthenticated && !isFirstTimeUser) {
        const profileSetup = await storageService.getProfileSetup();
        console.log('🔍 Profile setup check:', profileSetup);
        setNeedsProfileSetup(!profileSetup);
      } else {
        setNeedsProfileSetup(false);
      }
    };
    
    if (!isLoading && !languageLoading) {
      checkProfileSetup();
    }
  }, [isAuthenticated, isFirstTimeUser, isLoading, languageLoading]);

  if (isLoading || languageLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isFirstTimeUser ? (
        <OnboardingNavigator />
      ) : needsProfileSetup ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        </Stack.Navigator>
      ) : isAuthenticated ? (
        <MainNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;