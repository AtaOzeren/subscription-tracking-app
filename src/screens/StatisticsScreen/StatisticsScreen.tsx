import React, { useState } from 'react';
import { View, Text, ScrollView, Animated, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDetailedStats } from '../../hooks/useQueries';
import MinimalLoader from '../../components/common/MinimalLoader';
import ProfileButton from '../../components/common/ProfileButton';
import NotificationButton from '../../components/common/NotificationButton';
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
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Use React Query hook for stats - automatic caching!
  const { data: stats, isLoading: loading, error, refetch, isRefetching } = useDetailedStats();

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

  const handleRefresh = () => {
    refetch();
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
            {error.message || t('stats.errorLoading')}
          </Text>
          <TouchableOpacity onPress={handleRefresh}>
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
            <View className="flex-row items-center gap-3">
              <NotificationButton />
              <ProfileButton onPress={handleProfilePress} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 125 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
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
        {/* Spending Card + Toggle Combined */}
        {stats && (
          <View className="bg-tracking-blue rounded-2xl mx-4 p-5 mb-4">
            <SpendingCard
              viewMode={viewMode}
              monthlyAmount={stats.summary.current_month_total}
              yearlyAmount={stats.projected_annual_cost}
              currency={currency}
              fadeAnim={fadeAnim}
            />

            {/* Spacing */}
            <View className="h-4" />

            {/* Toggle Buttons */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              slideAnim={slideAnim}
            />
          </View>
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
