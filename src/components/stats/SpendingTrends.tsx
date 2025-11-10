import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SpendingTrend } from '../../types/stats';
import { formatPrice } from '../../utils/currency';

interface SpendingTrendsProps {
  trends: SpendingTrend[];
  currency: string;
}

export const SpendingTrends: React.FC<SpendingTrendsProps> = ({
  trends,
  currency,
}) => {
  const { t } = useTranslation();

  if (!trends || trends.length === 0) {
    return null;
  }

  // Calculate max value for scaling
  const maxValue = Math.max(...trends.map(t => t.total_spending), 1);
  
  // Get screen width for chart sizing
  const chartWidth = Dimensions.get('window').width - 48; // 24px padding on each side
  const barWidth = (chartWidth - (trends.length - 1) * 8) / trends.length; // 8px gap between bars

  return (
    <View className="px-6 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-900 text-lg font-bold">
          {t('stats.spendingTrends')}
        </Text>
        <Text className="text-gray-500 text-xs">
          {t('stats.last6Months')}
        </Text>
      </View>

      <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {/* Chart */}
        <View className="flex-row items-end justify-between h-32 mb-3">
          {trends.map((trend, index) => {
            const height = (trend.total_spending / maxValue) * 100;
            
            return (
              <View 
                key={`${trend.month}-${index}`}
                className="items-center"
                style={{ width: barWidth }}
              >
                {/* Bar */}
                <View className="flex-1 w-full justify-end items-center">
                  <View 
                    className="bg-blue-500 rounded-t-lg w-full"
                    style={{ 
                      height: `${height}%`,
                      minHeight: trend.total_spending > 0 ? 4 : 0 
                    }}
                  />
                </View>
                
                {/* Month Label */}
                <Text className="text-gray-400 text-xs mt-2">
                  {trend.month.substring(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View className="border-t border-gray-100 pt-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500 text-xs">
              {t('stats.average')}
            </Text>
            <Text className="text-gray-900 text-sm font-semibold">
              {formatPrice(
                trends.reduce((sum, t) => sum + t.total_spending, 0) / trends.length,
                currency
              )}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
