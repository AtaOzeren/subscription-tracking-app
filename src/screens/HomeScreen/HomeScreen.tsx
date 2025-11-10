import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getGreetingMessage } from '../../utils/helpers';
import ProfileButton from '../../components/common/ProfileButton';
import { StatsCards } from '../../components/stats/StatsCards';
import { TopSubscriptions } from '../../components/stats/TopSubscriptions';
import { SpendingTrends } from '../../components/stats/SpendingTrends';
import { statsService } from '../../services/statsService';
import { DetailedStatsResponse } from '../../types/stats';

interface HomeScreenProps {
  tabBarHeight?: number;
  onNavigateToProfile?: () => void;
}

const HomeScreen = ({ tabBarHeight = 100, onNavigateToProfile }: HomeScreenProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [greetingMessage, setGreetingMessage] = useState('');
  const [stats, setStats] = useState<DetailedStatsResponse | null>(null);
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
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      const data = await statsService.getDetailedStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      setError(t('stats.errorLoading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
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

  if (error || !stats) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-center mb-4">
            {error || t('stats.errorLoading')}
          </Text>
          <TouchableOpacity onPress={loadStats}>
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
          monthlySpending={stats.summary.current_month_total}
          yearlySpending={stats.projected_annual_cost}
          currency={Object.keys(stats.summary.currency_breakdown)[0] || 'USD'}
          activeSubscriptions={stats.summary.active_subscriptions}
          totalSubscriptions={stats.summary.total_subscriptions}
        />

        {/* Top Subscriptions */}
        <TopSubscriptions
          breakdown={stats.current_month_breakdown}
          userCurrency={Object.keys(stats.summary.currency_breakdown)[0] || 'USD'}
        />

        {/* Spending Trends */}
        <SpendingTrends
          trends={stats.spending_trends.last_6_months}
          currency={Object.keys(stats.summary.currency_breakdown)[0] || 'USD'}
        />

        {/* Quick Actions */}
        <View className="px-6 mt-2 mb-4">
          <Text className="text-gray-900 text-lg font-bold mb-3">
            {t('home.quickActions')}
          </Text>
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <TouchableOpacity 
              className="p-4 border-b border-gray-100"
              onPress={() => console.log('View all subscriptions')}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 font-medium">
                  {t('home.viewAllSubscriptions')}
                </Text>
                <Text className="text-blue-500 font-semibold">→</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              className="p-4"
              onPress={() => console.log('Add subscription')}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 font-medium">
                  {t('home.addNewSubscription')}
                </Text>
                <Text className="text-blue-500 font-semibold">+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
