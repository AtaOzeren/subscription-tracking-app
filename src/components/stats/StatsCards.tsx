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
      <View className="bg-tracking-blue rounded-2xl p-5 shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white/80 text-sm font-medium">
            {t('stats.monthlySpending')}
          </Text>
          <View className="bg-white/20 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {activeSubscriptions}/{totalSubscriptions}
            </Text>
          </View>
        </View>
        <Text className="text-white text-3xl font-bold">
          {formatPrice(monthlySpending, currency)}
        </Text>
        <Text className="text-white/70 text-xs mt-1">
          {t('stats.perMonth')}
        </Text>
      </View>


    </View>
  );
};
