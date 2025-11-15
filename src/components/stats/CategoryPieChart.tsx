import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, G } from 'react-native-svg';
import { CurrentMonthBreakdown } from '../../types/stats';
import { formatPrice } from '../../utils/currency';

interface CategoryPieChartProps {
  breakdown: CurrentMonthBreakdown[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ breakdown }) => {
  const { t } = useTranslation();

  if (!breakdown || breakdown.length === 0) return null;

  const size = 200;
  const radius = 85;
  const centerX = size / 2;
  const centerY = size / 2;

  // Take top 4 and group rest as "Others"
  const topSubs = breakdown.slice(0, 4);
  const othersPercentage = breakdown
    .slice(4)
    .reduce((sum, sub) => sum + sub.percentage, 0);

  const chartData = [...topSubs];
  if (othersPercentage > 0) {
    chartData.push({
      subscription_id: -1,
      subscription_name: t('stats.others'),
      amount: breakdown.slice(4).reduce((sum, sub) => sum + sub.amount, 0),
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

    currentAngle = endAngle;

    return {
      path: pathData,
      color: colors[index % colors.length],
      item,
    };
  });

  return (
    <View className="px-4 mb-4">
      <Text className="text-heading-4 text-text-primary mb-3 font-display">
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
                    stroke={pathItem.color}
                    strokeWidth={0.5}
                    strokeLinejoin="round"
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
                    className="text-body-sm text-text-primary flex-1 font-text"
                    numberOfLines={1}
                  >
                    {item.subscription_name}
                  </Text>
                </View>
                <View className="items-end ml-2">
                  <Text className="text-body-sm text-text-primary font-semibold font-display">
                    {item.percentage.toFixed(1)}%
                  </Text>
                  <Text className="text-body-sm text-text-muted font-text">
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
