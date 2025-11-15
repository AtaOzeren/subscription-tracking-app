import React from 'react';
import { View, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';

interface SpendingCardProps {
  viewMode: 'monthly' | 'yearly';
  monthlyAmount: number;
  yearlyAmount: number;
  currency: string;
  fadeAnim: Animated.Value;
}

export const SpendingCard: React.FC<SpendingCardProps> = ({
  viewMode,
  monthlyAmount,
  yearlyAmount,
  currency,
  fadeAnim,
}) => {
  const { t } = useTranslation();

  const amount = viewMode === 'monthly' ? monthlyAmount : yearlyAmount;

  const showYearlyInfo = () => {
    Alert.alert(
      t('stats.yearlyProjectionInfo'),
      t('stats.yearlyProjectionDescription'),
      [{ text: t('common.done'), style: 'default' }]
    );
  };

  return (
    <View className="px-4 mb-4">
      <View className="bg-white rounded-2xl p-5">
        <Animated.View 
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
          style={{ opacity: fadeAnim }}
        >
          <View className="flex-row items-center">
            <Text className="text-body-lg text-text-muted font-text">
              {viewMode === 'monthly' ? t('stats.monthlySpending') : t('stats.yearlyProjection')}
            </Text>
            {viewMode === 'yearly' && (
              <TouchableOpacity onPress={showYearlyInfo} className="ml-2">
                <View className="w-5 h-5 rounded-full border-2 border-accent items-center justify-center">
                  <Text className="text-accent text-body-sm font-bold font-display">
                    !
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-body-lg text-text-primary font-semibold font-text">
            {formatPrice(amount, currency)}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};
