import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserSubscription } from '../../types/subscription';
import { formatPrice } from '../../utils/currency';

interface UserSubscriptionCardProps {
  subscription: UserSubscription;
  onPress: (subscription: UserSubscription) => void;
}

const UserSubscriptionCard = ({
  subscription,
  onPress,
}: UserSubscriptionCardProps) => {
  const { t } = useTranslation();

  const getBillingCycleText = (cycle: string) => {
    // Map billing cycle values to translation keys
    const cycleMap: Record<string, string> = {
      'daily': 'subscription.perDay',
      'weekly': 'subscription.perWeek',
      'monthly': 'subscription.perMonth',
      'yearly': 'subscription.perYear',
    };
    return t(cycleMap[cycle.toLowerCase()] || 'subscription.perMonth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';      // Green
      case 'cancelled': return '#EF4444';   // Red
      case 'expired': return '#F59E0B';     // Orange
      case 'paused': return '#6B7280';      // Gray
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`subscriptionStatus.${status}` as any);
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
              className="text-heading-4 text-text-primary flex-1"
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
              className="text-body-md text-text-tertiary mb-1"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.planName}
            </Text>
          )}

          <Text className="text-heading-3 text-accent mt-1">
            {formatPrice(subscription.price, subscription.currency)}
            <Text className="text-body-md font-normal text-text-muted">
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between items-center">
        <Text className="text-body-sm text-text-muted" style={{ fontFamily: 'SF Pro Text' }}>
          {t('subscription.nextBilling')}: {new Date(subscription.nextBillingDate).toLocaleDateString()}
        </Text>
        <Text 
          className="text-xs"
          style={{ 
            fontFamily: 'SF Pro Text', 
            color: getStatusColor(subscription.status) 
          }}
        >
          {getStatusLabel(subscription.status)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserSubscriptionCard;
