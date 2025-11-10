import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { UserSubscription } from '../../types/subscription';
import { formatPrice } from '../../utils/currency';

interface MinimalSubscriptionCardProps {
  subscription: UserSubscription;
  onPress: (subscription: UserSubscription) => void;
}

const MinimalSubscriptionCard = ({
  subscription,
  onPress,
}: MinimalSubscriptionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';      // Green
      case 'cancelled': return '#EF4444';   // Red
      case 'expired': return '#F59E0B';     // Orange
      case 'paused': return '#6B7280';      // Gray
      default: return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg p-3 mb-2 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      onPress={() => onPress(subscription)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Logo/Icon */}
        <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
          {subscription.logoUrl ? (
            <Image
              source={{ uri: subscription.logoUrl }}
              className="w-7 h-7 rounded-md"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-lg">{subscription.category.icon_url}</Text>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900"
            style={{ fontFamily: 'SF Pro Display' }}
            numberOfLines={1}
          >
            {subscription.name}
          </Text>
          
          {subscription.planName && (
            <Text
              className="text-xs text-gray-500 mt-0.5"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.planName}
            </Text>
          )}
        </View>

        {/* Price and Status */}
        <View className="flex-row items-center">
          <View 
            className="w-1.5 h-1.5 rounded-full mr-2"
            style={{ backgroundColor: getStatusColor(subscription.status) }}
          />
          <Text className="text-base font-bold text-blue-600">
            {formatPrice(subscription.price, subscription.currency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MinimalSubscriptionCard;