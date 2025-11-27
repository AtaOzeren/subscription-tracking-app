import React, { useState } from 'react';
import { View, Text, ScrollView, Animated, RefreshControl, TouchableOpacity, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Shine animation
  const shineAnim = React.useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - 32; // mx-4 = 16*2 = 32

  React.useEffect(() => {
    const startAnimation = () => {
      shineAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(12500),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    startAnimation();
  }, [shineAnim]);

  const translateX = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-cardWidth, cardWidth],
  });

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
          <View className="bg-tracking-blue rounded-2xl mx-4 overflow-hidden shadow-card mb-4 relative">
            {/* Main Background Gradient */}
            <LinearGradient
              colors={['#216477', '#174A59', '#0F3540']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            {/* Top Highlight */}
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.5 }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50%' }}
            />

            {/* Animated Shine Effect */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '50%',
                transform: [{ translateX }],
                opacity: 0.3,
                zIndex: 10,
              }}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>

            <View className="p-5">
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
