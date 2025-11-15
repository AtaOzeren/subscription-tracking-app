import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Animated, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { statsService } from '../../services/statsService';
import { DetailedStatsResponse } from '../../types/stats';
import MinimalLoader from '../../components/common/MinimalLoader';
import ProfileButton from '../../components/common/ProfileButton';
import { ViewModeToggle } from '../../components/stats/ViewModeToggle';
import { SpendingCard } from '../../components/stats/SpendingCard';
import { SubscriptionStatus } from '../../components/stats/SubscriptionStatus';
import { CategoryPieChart } from '../../components/stats/CategoryPieChart';
import { MonthlyExpenseChart } from '../../components/stats/MonthlyExpenseChart';

interface StatisticsScreenProps {
  scrollY?: Animated.Value;
  onNavigateToProfile?: () => void;
}

const StatisticsScreen = ({ scrollY, onNavigateToProfile }: StatisticsScreenProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DetailedStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  
  // Animation values for toggle slider
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  // Animation values for content fade
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleProfilePress = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const handleViewModeChange = (mode: 'monthly' | 'yearly') => {
    if (mode === viewMode) return;

    // Fade out content
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Change mode after fade out
      setViewMode(mode);
      
      // Fade in content
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });

    // Slide animation for toggle background
    Animated.spring(slideAnim, {
      toValue: mode === 'yearly' ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    // Initialize slide position
    slideAnim.setValue(viewMode === 'yearly' ? 1 : 0);
  }, []);

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <MinimalLoader size="large" color="#000000" />
          <Text className="text-body-lg text-text-tertiary mt-4 font-text">
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-body-lg text-accent-error text-center mb-4">
            {error}
          </Text>
          <TouchableOpacity onPress={loadStats}>
            <Text className="text-body-lg text-accent font-semibold">
              {t('common.tryAgain')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currency = stats ? Object.keys(stats.summary.currency_breakdown)[0] || 'USD' : 'USD';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header - Top Bar Style with Profile Button */}
      <View className="bg-white border-b border-gray-200">
        <View className="px-6 py-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-heading-1 text-text-primary font-display">
                {t('navigation.statistics')}
              </Text>
            </View>
            <ProfileButton onPress={handleProfilePress} />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 125 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        onScroll={scrollY ? Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        ) : undefined}
        scrollEventThrottle={16}
      >
        {/* Toggle Buttons */}
        <View className="mt-4">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            slideAnim={slideAnim}
          />
        </View>

        {/* Spending Card (Monthly or Yearly) */}
        {stats && (
          <SpendingCard
            viewMode={viewMode}
            monthlyAmount={stats.summary.current_month_total}
            yearlyAmount={stats.projected_annual_cost}
            currency={currency}
            fadeAnim={fadeAnim}
          />
        )}

        {/* Subscription Status Bar */}
        {stats && (
          <SubscriptionStatus
            totalSubscriptions={stats.summary.total_subscriptions}
            activeSubscriptions={stats.summary.active_subscriptions}
            cancelledSubscriptions={stats.summary.cancelled_subscriptions}
            inactiveSubscriptions={stats.summary.inactive_subscriptions}
          />
        )}

        {/* Pie Chart */}
        {stats && <CategoryPieChart breakdown={stats.current_month_breakdown} />}

        {/* Spending Trends */}
        {stats && (
          <MonthlyExpenseChart
            trends={stats.spending_trends.last_6_months}
            currency={currency}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticsScreen;
