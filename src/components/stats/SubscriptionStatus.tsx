import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SubscriptionStatusProps {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  inactiveSubscriptions: number;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  totalSubscriptions,
  activeSubscriptions,
  cancelledSubscriptions,
  inactiveSubscriptions,
}) => {
  const { t } = useTranslation();

  const statusData = [
    {
      label: t('stats.totalSubscriptions'),
      count: totalSubscriptions,
    },
    {
      label: t('stats.active'),
      count: activeSubscriptions,
    },
    {
      label: t('stats.cancelled'),
      count: cancelledSubscriptions,
    },
    {
      label: t('stats.inactive'),
      count: inactiveSubscriptions,
    },
  ];

  return (
    <View className="px-4 mb-4">
      <View className="bg-white rounded-2xl p-5">
        {statusData.map((status, index) => (
          <View
            key={index}
            className={`flex-row items-center justify-between py-3 ${
              index < statusData.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <Text className="text-body-lg text-text-muted font-text">
              {status.label}
            </Text>
            <Text className="text-body-lg text-text-primary font-semibold font-text">
              {status.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
