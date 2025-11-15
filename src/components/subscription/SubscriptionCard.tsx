import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Subscription } from '../../types/subscription';
import { formatPrice } from '../../utils/currency';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: (subscription: Subscription) => void;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
}

const SubscriptionCard = ({
  subscription,
  onPress,
}: SubscriptionCardProps) => {
  const { t } = useTranslation();
  
  const getBillingCycleText = (cycle: string) => {
    const cycleMap: Record<string, string> = {
      'daily': 'subscription.perDay',
      'weekly': 'subscription.perWeek',
      'monthly': 'subscription.perMonth',
      'yearly': 'subscription.perYear',
    };
    return t(cycleMap[cycle.toLowerCase()] || 'subscription.perMonth');
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
      onPress={() => onPress(subscription)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1 font-display">
            {subscription.name}
          </Text>
          <Text className="text-body-md text-text-muted mb-2 font-text">
            {subscription.category}
          </Text>
          <Text className="text-heading-3 text-accent font-display">
            {formatPrice(subscription.price, subscription.currency)}
            <Text className="text-body-md font-normal text-text-muted font-text">
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </Text>
        </View>
        
        <View className="items-end">
          <View 
            className="w-3 h-3 rounded-full mb-2"
            style={{ backgroundColor: subscription.isActive ? '#10B981' : '#EF4444' }}
          />
          <Text className="text-body-sm text-text-muted font-text">
            {subscription.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-body-sm text-text-muted font-text">
          Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SubscriptionCard;
