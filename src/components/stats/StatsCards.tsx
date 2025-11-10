import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';

interface StatsCardsProps {
  monthlySpending: number;
  currency: string;
  activeSubscriptions: number;
  totalSubscriptions: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  monthlySpending,
  currency,
  activeSubscriptions,
  totalSubscriptions,
}) => {
  const { t } = useTranslation();

  return (
    <View className="px-6 gap-3 mb-4">
      {/* Monthly Spending Card */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-500 text-sm font-medium">
            {t('stats.monthlySpending')}
          </Text>
          <View className="bg-blue-50 rounded-full px-3 py-1">
            <Text className="text-blue-600 text-xs font-semibold">
              {activeSubscriptions}/{totalSubscriptions}
            </Text>
          </View>
        </View>
        <Text className="text-gray-900 text-3xl font-bold">
          {formatPrice(monthlySpending, currency)}
        </Text>
        <Text className="text-gray-400 text-xs mt-1">
          {t('stats.perMonth')}
        </Text>
      </View>


    </View>
  );
};
