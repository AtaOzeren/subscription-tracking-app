import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { UserSubscription } from '../../types/subscription';

interface UserSubscriptionCardProps {
  subscription: UserSubscription;
  onPress: (subscription: UserSubscription) => void;
  onDelete: () => void;
}

const UserSubscriptionCard = ({
  subscription,
  onPress,
  onDelete,
}: UserSubscriptionCardProps) => {
  const formatPrice = (price: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      TRY: '₺',
      JPY: '¥',
    };
    return `${symbols[currency] || currency}${price.toFixed(2)}`;
  };

  const getBillingCycleText = (cycle: string) => {
    const cycles: Record<string, string> = {
      daily: '/day',
      weekly: '/week',
      monthly: '/month',
      yearly: '/year',
    };
    return cycles[cycle] || '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }}
      onPress={() => onPress(subscription)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Logo/Icon */}
        <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center mr-4">
          {subscription.logoUrl ? (
            <Image
              source={{ uri: subscription.logoUrl }}
              className="w-12 h-12 rounded-lg"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-2xl">{subscription.category.icon_url}</Text>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-lg font-bold text-gray-900 flex-1"
              style={{ fontFamily: 'SF Pro Display' }}
              numberOfLines={1}
            >
              {subscription.name}
            </Text>
            <View 
              className="w-2 h-2 rounded-full ml-2"
              style={{ backgroundColor: getStatusColor(subscription.status) }}
            />
          </View>
          
          {subscription.planName && (
            <Text
              className="text-sm text-gray-600 mb-1"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.planName}
            </Text>
          )}

          <View className="flex-row items-center mb-2">
            <Text className="text-xs mr-1">{subscription.category.icon_url}</Text>
            <Text
              className="text-xs text-gray-400"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.category.name}
            </Text>
            {subscription.isCustom && (
              <Text
                className="text-xs text-blue-600 ml-2"
                style={{ fontFamily: 'SF Pro Text' }}
              >
                Custom
              </Text>
            )}
          </View>

          <Text className="text-xl font-bold text-blue-600">
            {formatPrice(subscription.price, subscription.currency)}
            <Text className="text-sm font-normal text-gray-500">
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-50 rounded-full w-8 h-8 items-center justify-center ml-3"
        >
          <Text className="text-red-600 text-sm font-bold">×</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between items-center">
        <Text className="text-xs text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
          Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
        </Text>
        <Text 
          className="text-xs capitalize"
          style={{ 
            fontFamily: 'SF Pro Text', 
            color: getStatusColor(subscription.status) 
          }}
        >
          {subscription.status}
        </Text>
      </View>

      {/* Notes */}
      {subscription.notes && (
        <View className="mt-2 pt-2 border-t border-gray-50">
          <Text 
            className="text-xs text-gray-600" 
            style={{ fontFamily: 'SF Pro Text' }}
            numberOfLines={2}
          >
            {subscription.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default UserSubscriptionCard;