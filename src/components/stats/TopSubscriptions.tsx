import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CurrentMonthBreakdown } from '../../types/stats';
import { formatPrice } from '../../utils/currency';

interface TopSubscriptionsProps {
  breakdown: CurrentMonthBreakdown[];
}

export const TopSubscriptions: React.FC<TopSubscriptionsProps> = ({
  breakdown,
}) => {
  const { t } = useTranslation();

  if (!breakdown || breakdown.length === 0) {
    return (
      <View className="px-6 mb-4">
        <Text className="text-text-primary text-heading-4 mb-3">
          {t('stats.topSubscriptions')}
        </Text>
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-text-subtle text-center">
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
        <Text className="text-text-primary text-heading-4">
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
            key={`${item.subscription_id}-${index}`}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            style={{ width: 180 }}
          >
            {/* Logo and Name */}
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-lg bg-blue-100 mr-3 items-center justify-center">
                <Text className="text-accent text-lg font-bold">
                  {item.subscription_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text 
                  className="text-text-primary text-body-md font-semibold"
                  numberOfLines={2}
                >
                  {item.subscription_name}
                </Text>
              </View>
            </View>

            {/* Price */}
            <Text className="text-gray-900 text-xl font-bold mb-1">
              {formatPrice(item.amount, item.currency)}
            </Text>

            {/* Percentage Bar */}
            <View className="bg-gray-100 rounded-full h-2 mb-1 overflow-hidden">
              <View 
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </View>
            <Text className="text-text-muted text-body-sm">
              {item.percentage.toFixed(1)}% {t('stats.ofTotal')}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
