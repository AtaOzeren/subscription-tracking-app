import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (subscription.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [subscription.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#216477';      // Tracking Blue
      case 'cancelled': return '#EF4444';   // Red
      case 'expired': return '#F59E0B';     // Orange
      case 'paused': return '#6B7280';      // Gray
      default: return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-3 mb-2 shadow-card"
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
            className="text-body-lg text-text-primary font-semibold"
            style={{ fontFamily: 'SF Pro Display' }}
            numberOfLines={1}
          >
            {subscription.name}
          </Text>

          {subscription.planName && (
            <Text
              className="text-body-sm text-text-muted mt-0.5"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.planName}
            </Text>
          )}
        </View>

        {/* Status Indicator (Price Hidden) */}
        <View className="flex-row items-center">
          <Animated.View
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: getStatusColor(subscription.status),
              opacity: subscription.status === 'active' ? fadeAnim : 1
            }}
          />
          {/* Price hidden as requested */}
          {/* <Text className="text-base font-bold text-accent">
            {formatPrice(subscription.price, subscription.currency)}
          </Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MinimalSubscriptionCard;