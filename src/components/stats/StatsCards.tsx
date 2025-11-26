import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';
import { MonthlySpendingCard } from './MonthlySpendingCard';

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
      <MonthlySpendingCard
        amount={monthlySpending}
        currency={currency}
        activeSubscriptions={activeSubscriptions}
        totalSubscriptions={totalSubscriptions}
      />


    </View>
  );
};
