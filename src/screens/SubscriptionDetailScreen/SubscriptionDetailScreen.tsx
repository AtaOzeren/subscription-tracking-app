import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSubscription } from '../../types/subscription';

interface SubscriptionDetailScreenProps {
  route: {
    params: {
      subscription: UserSubscription;
      onDelete: (id: number) => void;
      onBack: () => void;
    };
  };
}

const SubscriptionDetailScreen = ({ route }: SubscriptionDetailScreenProps) => {
  const { subscription, onDelete, onBack } = route.params;

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
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return cycles[cycle] || cycle;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'active': return '#D1FAE5';
      case 'inactive': return '#FEF3C7';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete ${subscription.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(subscription.id);
            onBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={onBack} className="w-10">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text
          className="text-lg font-bold text-gray-900"
          style={{ fontFamily: 'SF Pro Display' }}
        >
          Subscription Details
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-red-50 rounded-full px-4 py-2"
        >
          <Text className="text-red-600 text-sm font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero Section */}
        <View className="bg-white p-6 mb-3">
          <View className="items-center mb-4">
            <View className="w-24 h-24 rounded-2xl bg-gray-100 items-center justify-center mb-4">
              {subscription.logoUrl ? (
                <Image
                  source={{ uri: subscription.logoUrl }}
                  className="w-20 h-20 rounded-xl"
                  resizeMode="contain"
                />
              ) : (
                <Text className="text-5xl">{subscription.category.icon_url}</Text>
              )}
            </View>
            
            <Text
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {subscription.name}
            </Text>

            {subscription.planName && (
              <Text
                className="text-base text-gray-600 mb-3"
                style={{ fontFamily: 'SF Pro Text' }}
              >
                {subscription.planName}
              </Text>
            )}

            <View
              className="px-4 py-1.5 rounded-full mb-2"
              style={{ backgroundColor: getStatusBackground(subscription.status) }}
            >
              <Text
                className="text-sm font-semibold capitalize"
                style={{ 
                  fontFamily: 'SF Pro Text',
                  color: getStatusColor(subscription.status)
                }}
              >
                {subscription.status}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View className="bg-gray-50 rounded-2xl p-6 items-center">
            <Text className="text-sm text-gray-500 mb-1" style={{ fontFamily: 'SF Pro Text' }}>
              {getBillingCycleText(subscription.billingCycle)} Cost
            </Text>
            <Text className="text-4xl font-bold text-blue-600" style={{ fontFamily: 'SF Pro Display' }}>
              {formatPrice(subscription.price, subscription.currency)}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View className="bg-white px-6 py-5 mb-3">
          <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'SF Pro Display' }}>
            Subscription Information
          </Text>

          {/* Category */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
              Category
            </Text>
            <View className="flex-row items-center">
              <Text className="text-base mr-2">{subscription.category.icon_url}</Text>
              <Text className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Text' }}>
                {subscription.category.name}
              </Text>
            </View>
          </View>

          {/* Billing Cycle */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
              Billing Cycle
            </Text>
            <Text className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Text' }}>
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </View>

          {/* Next Billing Date */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
              Next Billing Date
            </Text>
            <Text className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Text' }}>
              {new Date(subscription.nextBillingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
              Price
            </Text>
            <Text className="text-sm font-semibold text-blue-600" style={{ fontFamily: 'SF Pro Text' }}>
              {formatPrice(subscription.price, subscription.currency)}
            </Text>
          </View>

          {/* Currency */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
              Currency
            </Text>
            <Text className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Text' }}>
              {subscription.currency}
            </Text>
          </View>

          {/* Type */}
          <View className="flex-row items-center justify-between py-3">
            <Text className="text-sm text-gray-500" style={{ fontFamily: 'SF Pro Text' }}>
              Type
            </Text>
            <Text className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Text' }}>
              {subscription.isCustom ? 'Custom' : 'Preset'}
            </Text>
          </View>
        </View>

        {/* Features (if preset subscription) */}
        {subscription.features && Object.keys(subscription.features).length > 0 && (
          <View className="bg-white px-6 py-5 mb-3">
            <Text className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'SF Pro Display' }}>
              Features
            </Text>
            {Object.entries(subscription.features).map(([key, value], index, array) => (
              <View 
                key={key} 
                className={`flex-row items-center justify-between py-3 ${index !== array.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <Text className="text-sm text-gray-500 capitalize" style={{ fontFamily: 'SF Pro Text' }}>
                  {key.replace(/_/g, ' ')}
                </Text>
                <Text className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Text' }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {subscription.notes && (
          <View className="bg-white px-6 py-5">
            <Text className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'SF Pro Display' }}>
              Notes
            </Text>
            <Text className="text-sm text-gray-700 leading-6" style={{ fontFamily: 'SF Pro Text' }}>
              {subscription.notes}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionDetailScreen;
