import React from 'react';
import { View, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';
import Svg, { Polygon, Path } from 'react-native-svg';

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
    <View>
      <Animated.View
        className="flex-row items-center justify-between"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row items-center">
          <Text className="text-body-lg text-white/80 font-text">
            {viewMode === 'monthly' ? t('stats.monthlySpending') : t('stats.yearlyProjection')}
          </Text>
          {viewMode === 'yearly' && (
            <TouchableOpacity onPress={showYearlyInfo} className="ml-2">
              <View className="w-6 h-6 items-center justify-center" style={{ opacity: 0.7 }}>
                <Svg width="24" height="24" viewBox="0 0 24 24">
                  {/* Empty yellow triangle outline */}
                  <Polygon
                    points="12,3 22,21 2,21"
                    fill="none"
                    stroke="#FCD34D"
                    strokeWidth="2"
                  />
                  {/* Yellow exclamation mark (smaller) */}
                  <Path
                    d="M12 10 L12 14 M12 16.5 L12 17"
                    stroke="#FCD34D"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <Text className="text-heading-2 text-white font-semibold font-display">
          {formatPrice(amount, currency)}
        </Text>
      </Animated.View>
    </View>
  );
};
