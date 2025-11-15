import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SpendingTrend } from '../../types/stats';
import { formatPrice } from '../../utils/currency';

interface MonthlyExpenseChartProps {
  trends: SpendingTrend[];
  currency: string;
}

export const MonthlyExpenseChart: React.FC<MonthlyExpenseChartProps> = ({ trends, currency }) => {
  const { t } = useTranslation();

  if (!trends || !trends.length) return null;

  const maxAmount = Math.max(...trends.map(t => t.amount), 1);
  
  // Calculate average and total
  const total = trends.reduce((sum, t) => sum + t.amount, 0);
  const average = total / trends.length;
  
  // Find highest and lowest spending months
  const highest = trends.reduce((max, t) => t.amount > max.amount ? t : max, trends[0]);
  const lowest = trends.reduce((min, t) => (t.amount > 0 && t.amount < min.amount) ? t : min, trends[0]);

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('default', { month: 'short' });
  };

  return (
    <View className="px-4 mb-4">
      <Text className="text-heading-4 text-text-primary mb-3 font-display">
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
                          className="text-body-sm font-semibold mb-1 font-text"
                          style={{ 
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
                  className="text-body-sm mt-1 font-text"
                  style={{ 
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
              <Text className="text-body-sm text-text-muted mb-1 font-text">
                {t('stats.average')}
              </Text>
              <Text className="text-body-md text-text-primary font-semibold font-display">
                {formatPrice(average, currency)}
              </Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-body-sm text-text-muted mb-1 font-text">
                {t('stats.highest')}
              </Text>
              <Text className="text-body-md text-accent-success font-semibold font-display">
                {formatPrice(highest.amount, currency)}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-body-sm text-text-muted mb-1 font-text">
                {t('stats.lowest')}
              </Text>
              <Text className="text-body-md text-accent-error font-semibold font-display">
                {formatPrice(lowest.amount, currency)}
              </Text>
            </View>
          </View>
          
          <View className="bg-gray-50 rounded-xl p-3">
            <View className="flex-row justify-between">
              <Text className="text-body-sm text-text-muted font-text">
                {t('stats.total6Months')}
              </Text>
              <Text className="text-body-lg text-text-primary font-bold font-display">
                {formatPrice(total, currency)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
