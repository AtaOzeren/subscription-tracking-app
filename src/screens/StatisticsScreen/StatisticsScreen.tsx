import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Animated, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { statsService } from '../../services/statsService';
import { DetailedStatsResponse } from '../../types/stats';
import MinimalLoader from '../../components/common/MinimalLoader';
import { formatPrice } from '../../utils/currency';

interface StatisticsScreenProps {
  scrollY?: Animated.Value;
}

const StatisticsScreen = ({ scrollY }: StatisticsScreenProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DetailedStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('default', { month: 'short' });
  };

  const renderSummaryCards = () => {
    if (!stats) return null;

    const cards = [
      {
        title: t('stats.totalSubscriptions'),
        value: stats.summary.total_subscriptions.toString(),
        subtitle: `${stats.summary.active_subscriptions} ${t('stats.active')}`,
        color: '#3B82F6',
      },
      {
        title: t('stats.monthlySpending'),
        value: formatPrice(stats.summary.current_month_total, Object.keys(stats.summary.currency_breakdown)[0] || 'USD'),
        subtitle: t('stats.thisMonth'),
        color: '#10B981',
      },
      {
        title: t('stats.yearlyProjection'),
        value: formatPrice(stats.projected_annual_cost, Object.keys(stats.projected_annual_cost_by_currency)[0] || 'USD'),
        subtitle: t('stats.perYear'),
        color: '#F59E0B',
      },
    ];

    return (
      <View className="px-4 mb-4">
        <View className="flex-row flex-wrap justify-between">
          {cards.map((card, index) => (
            <View
              key={index}
              className="bg-white rounded-xl p-4 mb-3"
              style={{ width: '48%' }}
            >
              <Text className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'SF Pro Text' }}>
                {card.title}
              </Text>
              <Text
                className="text-2xl font-bold mb-1"
                style={{ fontFamily: 'SF Pro Display', color: card.color }}
              >
                {card.value}
              </Text>
              <Text className="text-xs text-gray-400" style={{ fontFamily: 'SF Pro Text' }}>
                {card.subtitle}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTopSubscriptions = () => {
    if (!stats || stats.current_month_breakdown.length === 0) return null;

    return (
      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'SF Pro Display' }}>
          {t('stats.topSubscriptions')}
        </Text>
        <View className="bg-white rounded-xl p-4">
          {stats.current_month_breakdown.map((sub, index) => (
            <View
              key={sub.subscription_id}
              className={`flex-row items-center justify-between ${
                index < stats.current_month_breakdown.length - 1 ? 'mb-3 pb-3 border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: 'SF Pro Display' }}>
                  {sub.subscription_name}
                </Text>
                <View className="bg-gray-200 rounded-full h-2 mr-4">
                  <View
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${sub.percentage}%` }}
                  />
                </View>
              </View>
              <View className="items-end ml-2">
                <Text className="text-base font-bold text-gray-900" style={{ fontFamily: 'SF Pro Display' }}>
                  {formatPrice(sub.amount, sub.currency)}
                </Text>
                <Text className="text-xs text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
                  {sub.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSpendingTrends = () => {
    if (!stats || !stats.spending_trends.last_6_months.length) return null;

    const trends = stats.spending_trends.last_6_months;
    const maxAmount = Math.max(...trends.map(t => t.amount), 1);
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 32; // padding
    const barWidth = (chartWidth - 60) / trends.length; // 60 for labels

    return (
      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'SF Pro Display' }}>
          {t('stats.spendingTrends')}
        </Text>
        <View className="bg-white rounded-xl p-4">
          <View className="flex-row items-end justify-between" style={{ height: 120 }}>
            {trends.map((trend, index) => {
              const height = maxAmount > 0 ? (trend.amount / maxAmount) * 100 : 0;
              return (
                <View key={index} className="items-center" style={{ width: barWidth }}>
                  <View className="flex-1 justify-end items-center mb-2">
                    {trend.amount > 0 && (
                      <View
                        className="bg-blue-500 rounded-t-lg w-full"
                        style={{
                          height: `${height}%`,
                          minHeight: height > 0 ? 4 : 0,
                        }}
                      />
                    )}
                  </View>
                  <Text className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'SF Pro Text' }}>
                    {getMonthName(trend.month)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <MinimalLoader size="large" color="#000000" />
          <Text className="text-gray-600 mt-4 text-base" style={{ fontFamily: 'SF Pro Text' }}>
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
          <Text className="text-red-500 text-center mb-4">
            {error}
          </Text>
          <Text className="text-blue-500 font-semibold" onPress={loadStats}>
            {t('common.tryAgain')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'SF Pro Display' }}>
            {t('navigation.statistics')}
          </Text>
          <Text className="text-base text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
            {t('statistics.viewYourSpending')}
          </Text>
        </View>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Top Subscriptions */}
        {renderTopSubscriptions()}

        {/* Spending Trends */}
        {renderSpendingTrends()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticsScreen;
