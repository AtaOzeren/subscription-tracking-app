import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
  onEdit,
  onDelete,
}: SubscriptionCardProps) => {
  const getBillingCycleText = (cycle: string) => {
    const cycles: Record<string, string> = {
      daily: '/day',
      weekly: '/week',
      monthly: '/month',
      yearly: '/year',
    };
    return cycles[cycle] || '';
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
      onPress={() => onPress(subscription)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            {subscription.name}
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            {subscription.category}
          </Text>
          <Text className="text-xl font-bold text-blue-600">
            {formatPrice(subscription.price, subscription.currency)}
            <Text className="text-sm font-normal text-gray-500">
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </Text>
        </View>
        
        <View className="items-end">
          <View 
            className="w-3 h-3 rounded-full mb-2"
            style={{ backgroundColor: subscription.isActive ? '#10B981' : '#EF4444' }}
          />
          <Text className="text-xs text-gray-500">
            {subscription.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-xs text-gray-500">
          Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SubscriptionCard;