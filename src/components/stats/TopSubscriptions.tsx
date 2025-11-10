import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CurrentMonthBreakdown } from '../../types/stats';
import { formatPrice } from '../../utils/currency';

interface TopSubscriptionsProps {
  breakdown: CurrentMonthBreakdown[];
  userCurrency: string;
}

export const TopSubscriptions: React.FC<TopSubscriptionsProps> = ({
  breakdown,
  userCurrency,
}) => {
  const { t } = useTranslation();

  if (!breakdown || breakdown.length === 0) {
    return (
      <View className="px-6 mb-4">
        <Text className="text-gray-900 text-lg font-bold mb-3">
          {t('stats.topSubscriptions')}
        </Text>
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-gray-400 text-center">
            {t('stats.noSubscriptions')}
          </Text>
        </View>
      </View>
    );
  }

  // Show top 3 subscriptions
  const topThree = breakdown.slice(0, 3);

  return (
    <View className="mb-4">
      <View className="px-6 mb-3">
        <Text className="text-gray-900 text-lg font-bold">
          {t('stats.topSubscriptions')}
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {topThree.map((item, index) => (
          <View 
            key={`${item.subscription_name}-${index}`}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            style={{ width: 180 }}
          >
            {/* Logo and Name */}
            <View className="flex-row items-center mb-3">
              {item.logo_url ? (
                <Image 
                  source={{ uri: item.logo_url }}
                  className="w-10 h-10 rounded-lg mr-3"
                  resizeMode="contain"
                />
              ) : (
                <View className="w-10 h-10 rounded-lg bg-gray-100 mr-3 items-center justify-center">
                  <Text className="text-gray-400 text-xs font-bold">
                    {item.subscription_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text 
                  className="text-gray-900 text-sm font-semibold"
                  numberOfLines={1}
                >
                  {item.subscription_name}
                </Text>
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
            </View>

            {/* Price */}
            <Text className="text-gray-900 text-xl font-bold mb-1">
              {formatPrice(item.monthly_cost, userCurrency)}
            </Text>

            {/* Percentage Bar */}
            <View className="bg-gray-100 rounded-full h-2 mb-1 overflow-hidden">
              <View 
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </View>
            <Text className="text-gray-500 text-xs">
              {item.percentage.toFixed(1)}% {t('stats.ofTotal')}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
