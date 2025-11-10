import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getGreetingMessage } from '../../utils/helpers';
import ProfileButton from '../../components/common/ProfileButton';
import { StatsCards } from '../../components/stats/StatsCards';
import MinimalSubscriptionCard from '../../components/subscription/MinimalSubscriptionCard';
import { mySubscriptionsService } from '../../services/mySubscriptionsService';
import { UserSubscription } from '../../types/subscription';

interface HomeScreenProps {
  tabBarHeight?: number;
  onNavigateToProfile?: () => void;
}

const HomeScreen = ({ tabBarHeight = 100, onNavigateToProfile }: HomeScreenProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [greetingMessage, setGreetingMessage] = useState('');
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update greeting message when user changes or every minute
    const updateGreeting = () => {
      if (user?.name) {
        setGreetingMessage(getGreetingMessage(user.name, t));
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.name, t]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setError(null);
      const data = await mySubscriptionsService.getMySubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSubscriptions();
  };

  const handleProfilePress = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center mb-4">
            {error}
          </Text>
          <TouchableOpacity onPress={loadSubscriptions}>
            <Text className="text-blue-500 font-semibold">
              {t('common.tryAgain')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        contentContainerStyle={{ paddingBottom: tabBarHeight + insets.bottom + 25 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-gray-900">
                {greetingMessage || t('home.mySubscriptions')}
              </Text>
            </View>
            <ProfileButton onPress={handleProfilePress} />
          </View>
        </View>

        {/* Stats Cards */}
        <StatsCards
          monthlySpending={subscriptions
            .filter(sub => sub.status === 'active')
            .reduce((sum, sub) => sum + sub.price, 0)}
          currency={subscriptions.length > 0 ? subscriptions[0].currency : 'USD'}
          activeSubscriptions={subscriptions.filter(sub => sub.status === 'active').length}
          totalSubscriptions={subscriptions.length}
        />

        {/* Active Subscriptions */}
        <View className="px-6 mb-4">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            {t('home.activeSubscriptions')}
          </Text>
          {subscriptions
            .filter(sub => sub.status === 'active')
            .map((subscription) => (
              <MinimalSubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onPress={(subscription) => console.log('Subscription pressed:', subscription.name)}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
