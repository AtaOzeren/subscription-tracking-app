import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Animated, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
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
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

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

  const renderToggleButtons = () => {
    return (
      <View className="px-4 mb-4">
        <View className="bg-gray-200 rounded-full p-1 flex-row">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-full ${viewMode === 'monthly' ? 'bg-white' : ''}`}
            onPress={() => setViewMode('monthly')}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold ${
                viewMode === 'monthly' ? 'text-black' : 'text-gray-500'
              }`}
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t('statistics.monthly')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-full ${viewMode === 'yearly' ? 'bg-white' : ''}`}
            onPress={() => setViewMode('yearly')}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold ${
                viewMode === 'yearly' ? 'text-black' : 'text-gray-500'
              }`}
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t('statistics.yearly')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSpendingCard = () => {
    if (!stats) return null;

    const amount = viewMode === 'monthly' 
      ? stats.summary.current_month_total 
      : stats.projected_annual_cost;
    
    const currency = Object.keys(stats.summary.currency_breakdown)[0] || 'USD';
    const label = viewMode === 'monthly' ? t('stats.thisMonth') : t('stats.perYear');

    return (
      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-6">
          <Text className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'SF Pro Text' }}>
            {viewMode === 'monthly' ? t('stats.monthlySpending') : t('stats.yearlyProjection')}
          </Text>
          <Text
            className="text-4xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            {formatPrice(amount, currency)}
          </Text>
          <Text className="text-sm text-gray-400" style={{ fontFamily: 'SF Pro Text' }}>
            {label}
          </Text>
        </View>
      </View>
    );
  };

  const renderSubscriptionStatusBar = () => {
    if (!stats) return null;

    const statusData = [
      {
        label: t('stats.active'),
        count: stats.summary.active_subscriptions,
        color: '#10B981',
        bgColor: '#D1FAE5',
      },
      {
        label: t('stats.cancelled'),
        count: stats.summary.cancelled_subscriptions,
        color: '#EF4444',
        bgColor: '#FEE2E2',
      },
      {
        label: t('stats.inactive'),
        count: stats.summary.inactive_subscriptions,
        color: '#6B7280',
        bgColor: '#F3F4F6',
      },
    ];

    return (
      <View className="px-4 mb-4">
        <View className="bg-white rounded-2xl p-5">
          <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'SF Pro Display' }}>
            {t('stats.totalSubscriptions')}
          </Text>
          
          {/* Table format like ProfileScreen */}
          {statusData.map((status, index) => (
            <View
              key={index}
              className={`flex-row items-center justify-between py-3 ${
                index < statusData.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Text
                className="text-base text-gray-500"
                style={{ fontFamily: 'SF Pro Text' }}
              >
                {status.label}
              </Text>
              <Text
                className="text-base font-semibold"
                style={{ fontFamily: 'SF Pro Text', color: status.color }}
              >
                {status.count}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    if (!stats || stats.current_month_breakdown.length === 0) return null;

    const size = 200;
    const radius = 80;
    const centerX = size / 2;
    const centerY = size / 2;

    // Take top 4 and group rest as "Others"
    const topSubs = stats.current_month_breakdown.slice(0, 4);
    const othersPercentage = stats.current_month_breakdown
      .slice(4)
      .reduce((sum, sub) => sum + sub.percentage, 0);

    const chartData = [...topSubs];
    if (othersPercentage > 0) {
      chartData.push({
        subscription_id: -1,
        subscription_name: t('stats.others'),
        amount: stats.current_month_breakdown.slice(4).reduce((sum, sub) => sum + sub.amount, 0),
        currency: topSubs[0].currency,
        percentage: othersPercentage,
      });
    }

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    let currentAngle = -90; // Start from top

    const paths = chartData.map((item, index) => {
      const angle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      // Convert to radians
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Calculate arc points
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      // Calculate label position (in the middle of the slice)
      const labelAngle = startAngle + angle / 2;
      const labelRad = (labelAngle * Math.PI) / 180;
      const labelRadius = radius * 0.65; // Position at 65% of radius
      const labelX = centerX + labelRadius * Math.cos(labelRad);
      const labelY = centerY + labelRadius * Math.sin(labelRad);

      currentAngle = endAngle;

      return {
        path: pathData,
        color: colors[index % colors.length],
        item,
        labelX,
        labelY,
      };
    });

    return (
      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'SF Pro Display' }}>
          {t('stats.topSubscriptions')}
        </Text>
        <View className="bg-white rounded-2xl p-4">
          {/* Pie Chart and Legend side by side */}
          <View className="flex-row">
            {/* Pie Chart - Left Side */}
            <View className="items-center justify-center" style={{ width: size }}>
              <Svg width={size} height={size}>
                <G>
                  {paths.map((pathItem, index) => (
                    <Path
                      key={index}
                      d={pathItem.path}
                      fill={pathItem.color}
                    />
                  ))}
                </G>
              </Svg>
            </View>

            {/* Legend - Right Side */}
            <View className="flex-1 ml-4 justify-center">
              {chartData.map((item, index) => (
                <View
                  key={index}
                  className={`flex-row items-center justify-between py-2 ${
                    index < chartData.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <Text
                      className="text-xs text-gray-900 flex-1"
                      style={{ fontFamily: 'SF Pro Text' }}
                      numberOfLines={1}
                    >
                      {item.subscription_name}
                    </Text>
                  </View>
                  <View className="items-end ml-2">
                    <Text className="text-xs font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Display' }}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                    <Text className="text-xs text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
                      {formatPrice(item.amount, item.currency)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSpendingTrends = () => {
    if (!stats || !stats.spending_trends.last_6_months.length) return null;

    const trends = stats.spending_trends.last_6_months;
    const maxAmount = Math.max(...trends.map(t => t.amount), 1);
    const currency = Object.keys(stats.summary.currency_breakdown)[0] || 'USD';
    
    // Calculate average and total
    const total = trends.reduce((sum, t) => sum + t.amount, 0);
    const average = total / trends.length;
    
    // Find highest and lowest spending months
    const highest = trends.reduce((max, t) => t.amount > max.amount ? t : max, trends[0]);
    const lowest = trends.reduce((min, t) => (t.amount > 0 && t.amount < min.amount) ? t : min, trends[0]);

    return (
      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'SF Pro Display' }}>
          {t('stats.spendingTrends')}
        </Text>
        <View className="bg-white rounded-2xl p-4">
          {/* Bar Chart */}
          <View className="flex-row items-end justify-between mb-4" style={{ height: 140 }}>
            {trends.map((trend, index) => {
              const height = maxAmount > 0 ? (trend.amount / maxAmount) * 100 : 0;
              const isHighest = trend.month === highest.month;
              const isLowest = trend.month === lowest.month && trend.amount > 0;
              
              return (
                <View key={index} className="items-center flex-1">
                  <View className="flex-1 justify-end items-center mb-2 w-full">
                    {trend.amount > 0 && (
                      <>
                        {/* Amount label on top of bar */}
                        {height > 30 && (
                          <Text 
                            className="text-xs font-semibold mb-1"
                            style={{ 
                              fontFamily: 'SF Pro Text',
                              color: isHighest ? '#10B981' : isLowest ? '#EF4444' : '#3B82F6'
                            }}
                          >
                            {formatPrice(trend.amount, currency).replace(/\.\d+/, '')}
                          </Text>
                        )}
                        <View
                          className="rounded-t-lg"
                          style={{
                            height: `${height}%`,
                            width: '80%',
                            minHeight: height > 0 ? 8 : 0,
                            backgroundColor: isHighest ? '#10B981' : isLowest ? '#EF4444' : '#3B82F6',
                          }}
                        />
                      </>
                    )}
                  </View>
                  <Text 
                    className="text-xs mt-1"
                    style={{ 
                      fontFamily: 'SF Pro Text',
                      color: isHighest || isLowest ? '#1F2937' : '#6B7280',
                      fontWeight: isHighest || isLowest ? '600' : '400'
                    }}
                  >
                    {getMonthName(trend.month)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Statistics Summary */}
          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'SF Pro Text' }}>
                  {t('stats.average')}
                </Text>
                <Text className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Display' }}>
                  {formatPrice(average, currency)}
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'SF Pro Text' }}>
                  {t('stats.highest')}
                </Text>
                <Text className="text-sm font-semibold text-green-600" style={{ fontFamily: 'SF Pro Display' }}>
                  {formatPrice(highest.amount, currency)}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'SF Pro Text' }}>
                  {t('stats.lowest')}
                </Text>
                <Text className="text-sm font-semibold text-red-600" style={{ fontFamily: 'SF Pro Display' }}>
                  {formatPrice(lowest.amount, currency)}
                </Text>
              </View>
            </View>
            
            <View className="bg-gray-50 rounded-xl p-3">
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
                  {t('stats.total6Months')}
                </Text>
                <Text className="text-base font-bold text-gray-900" style={{ fontFamily: 'SF Pro Display' }}>
                  {formatPrice(total, currency)}
                </Text>
              </View>
            </View>
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

        {/* Toggle Buttons */}
        {renderToggleButtons()}

        {/* Spending Card (Monthly or Yearly) */}
        {renderSpendingCard()}

        {/* Subscription Status Bar */}
        {renderSubscriptionStatusBar()}

        {/* Pie Chart */}
        {renderPieChart()}

        {/* Spending Trends */}
        {renderSpendingTrends()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatisticsScreen;
