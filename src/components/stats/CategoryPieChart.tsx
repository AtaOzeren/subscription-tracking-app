import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { CurrentMonthBreakdown } from '../../types/stats';
import { formatPrice } from '../../utils/currency';

interface CategoryPieChartProps {
  breakdown: CurrentMonthBreakdown[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ breakdown }) => {
  const { t } = useTranslation();

  if (!breakdown || breakdown.length === 0) return null;

  const size = 200;
  const strokeWidth = 20; // Thickness of the donut
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const circumference = 2 * Math.PI * radius;

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

  const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const currency = breakdown[0]?.currency || 'USD';

  // Richer Palette with Gradients
  const palette = [
    { start: '#60A5FA', end: '#2563EB' }, // Blue
    { start: '#34D399', end: '#059669' }, // Green
    { start: '#FBBF24', end: '#D97706' }, // Amber
    { start: '#F87171', end: '#DC2626' }, // Red
    { start: '#A78BFA', end: '#7C3AED' }, // Purple
  ];

  let currentAngle = -90; // Start from top

  const segments = chartData.map((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Add a small gap between segments (reduce sweep angle slightly)
    const gapAngle = 4; // degrees
    const sweepAngle = Math.max(0, angle - gapAngle);

    // Calculate path for the arc
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + sweepAngle) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = sweepAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
    ].join(' ');

    currentAngle = endAngle;

    return {
      path: pathData,
      colors: palette[index % palette.length],
      item,
    };
  });

  return (
    <View className="px-4 mb-4">
      <Text className="text-heading-4 text-text-primary mb-3 font-display">
        {t('stats.topSubscriptions')}
      </Text>
      <View className="bg-white rounded-2xl p-6 shadow-card">
        <View className="flex-row items-center">
          {/* Donut Chart - Left Side */}
          <View className="items-center justify-center relative" style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
              <Defs>
                {segments.map((s, i) => (
                  <LinearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={s.colors.start} />
                    <Stop offset="100%" stopColor={s.colors.end} />
                  </LinearGradient>
                ))}
              </Defs>

              {/* Background Circle (optional, for empty state or track) */}
              <Path
                d={`M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`}
                stroke="#F3F4F6"
                strokeWidth={strokeWidth}
                fill="none"
              />

              {segments.map((segment, index) => (
                <Path
                  key={index}
                  d={segment.path}
                  stroke={`url(#grad-${index})`}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
            </Svg>

            {/* Center Text */}
            <View className="absolute items-center justify-center">
              <Text className="text-text-tertiary text-xs font-medium font-text mb-0.5">
                {t('stats.total')}
              </Text>
              <Text className="text-text-primary text-xl font-bold font-display">
                {formatPrice(totalAmount, currency)}
              </Text>
            </View>
          </View>

          {/* Legend - Right Side */}
          <View className="flex-1 ml-6 justify-center space-y-3">
            {chartData.map((item, index) => {
              const colorSet = palette[index % palette.length];
              return (
                <View key={index} className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: colorSet.end }}
                    />
                    <Text
                      className="text-body-sm text-text-secondary flex-1 font-text"
                      numberOfLines={1}
                    >
                      {item.subscription_name}
                    </Text>
                  </View>
                  <Text className="text-body-sm text-text-primary font-semibold font-display">
                    {item.percentage.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};
