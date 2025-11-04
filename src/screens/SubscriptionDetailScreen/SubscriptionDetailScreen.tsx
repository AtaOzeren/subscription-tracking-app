import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserSubscription } from '../../types/subscription';
import { mySubscriptionsService } from '../../services/mySubscriptionsService';
import FormField from '../../components/subscription/FormField';
import AppleButton from '../../components/common/AppleButton';

interface SubscriptionDetailScreenProps {
  route: {
    params: {
      subscription: UserSubscription;
      onDelete: (id: number) => void;
      onBack: () => void;
      onUpdate?: () => void;
    };
  };
}

const SubscriptionDetailScreen = ({ route }: SubscriptionDetailScreenProps) => {
  const { subscription, onDelete, onBack, onUpdate } = route.params;
  const insets = useSafeAreaInsets();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Edit form states
  const [editPrice, setEditPrice] = useState(subscription.price.toString());
  const [editNextBillingDate, setEditNextBillingDate] = useState(subscription.nextBillingDate);
  const [editStatus, setEditStatus] = useState<'active' | 'inactive' | 'cancelled'>(subscription.status);
  const [editNotes, setEditNotes] = useState(subscription.notes || '');
  const [loading, setLoading] = useState(false);

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
    setShowMenu(false);
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

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleUpdateSubscription = async () => {
    try {
      setLoading(true);
      
      const updates: any = {
        next_billing_date: editNextBillingDate,
        status: editStatus,
        notes: editNotes || undefined,
      };

      // Only include custom_price if it's a custom subscription
      if (subscription.isCustom) {
        updates.custom_price = parseFloat(editPrice);
      }

      await mySubscriptionsService.updateSubscription(subscription.id, updates);
      
      setShowEditModal(false);
      
      Alert.alert(
        'Success',
        'Subscription updated successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (onUpdate) {
                onUpdate();
              }
              onBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header - Fixed at top with status bar */}
      <View 
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack}>
            <Text
              className="text-base font-semibold text-gray-700"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <View className="flex-1" />
          {/* Three Dots Menu */}
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-2xl text-gray-700">⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero Section - Icon Left, Info Right */}
        <View className="bg-white p-6 mb-3">
          <View className="flex-row mb-6">
            {/* Icon/Logo - Left */}
            <View className="w-24 h-24 rounded-2xl bg-gray-100 items-center justify-center mr-4">
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

            {/* Info - Right */}
            <View className="flex-1 justify-center">
              <Text
                className="text-2xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: 'SF Pro Display' }}
                numberOfLines={2}
              >
                {subscription.name}
              </Text>

              {subscription.planName && (
                <Text
                  className="text-base text-gray-600 mb-2"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {subscription.planName}
                </Text>
              )}

              <View
                className="px-3 py-1.5 rounded-full self-start"
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
          </View>

          {/* Price Section */}
          <View className="bg-gray-50 rounded-2xl p-6 items-center">
            <Text 
              className="text-sm text-gray-500 mb-1" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {getBillingCycleText(subscription.billingCycle)} Cost
            </Text>
            <Text 
              className="text-4xl font-bold text-blue-600" 
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {formatPrice(subscription.price, subscription.currency)}
            </Text>
          </View>
        </View>

        {/* Subscription Information */}
        <View className="bg-white px-6 py-5 mb-3">
          <Text 
            className="text-xl font-bold text-gray-900 mb-4" 
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Subscription Information
          </Text>

          {/* Category */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text 
              className="text-base text-gray-500" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              Category
            </Text>
            <Text 
              className="text-base font-semibold text-gray-900" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.category.name}
            </Text>
          </View>

          {/* Billing Cycle */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text 
              className="text-base text-gray-500" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              Billing Cycle
            </Text>
            <Text 
              className="text-base font-semibold text-gray-900" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </View>

          {/* Next Billing Date */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text 
              className="text-base text-gray-500" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              Next Billing Date
            </Text>
            <Text 
              className="text-base font-semibold text-gray-900" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {new Date(subscription.nextBillingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text 
              className="text-base text-gray-500" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              Price
            </Text>
            <Text 
              className="text-base font-semibold text-blue-600" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {formatPrice(subscription.price, subscription.currency)}
            </Text>
          </View>

          {/* Currency */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text 
              className="text-base text-gray-500" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              Currency
            </Text>
            <Text 
              className="text-base font-semibold text-gray-900" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.currency}
            </Text>
          </View>

          {/* Type */}
          <View className="flex-row items-center justify-between py-3">
            <Text 
              className="text-base text-gray-500" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              Type
            </Text>
            <Text 
              className="text-base font-semibold text-gray-900" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.isCustom ? 'Custom' : 'Preset'}
            </Text>
          </View>
        </View>

        {/* Features (if preset subscription) */}
        {subscription.features && Object.keys(subscription.features).length > 0 && (
          <View className="bg-white px-6 py-5 mb-3">
            <Text 
              className="text-xl font-bold text-gray-900 mb-4" 
              style={{ fontFamily: 'SF Pro Display' }}
            >
              Features
            </Text>
            {Object.entries(subscription.features).map(([key, value], index, array) => (
              <View 
                key={key} 
                className={`flex-row items-center justify-between py-3 ${index !== array.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <Text 
                  className="text-base text-gray-500 capitalize" 
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {key.replace(/_/g, ' ')}
                </Text>
                <Text 
                  className="text-base font-semibold text-gray-900" 
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {subscription.notes && (
          <View className="bg-white px-6 py-5">
            <Text 
              className="text-xl font-bold text-gray-900 mb-3" 
              style={{ fontFamily: 'SF Pro Display' }}
            >
              Notes
            </Text>
            <Text 
              className="text-base text-gray-700 leading-6" 
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.notes}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View 
            className="bg-white border-b border-gray-200"
            style={{ paddingTop: insets.top }}
          >
            <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text
                  className="text-base font-semibold text-gray-700"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text
                className="text-3xl font-bold text-gray-900 flex-1 text-center"
                style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
              >
                Edit Subscription
              </Text>
              <View style={{ width: 60 }} />
            </View>
          </View>

          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
            {/* Subscription Info */}
            <View className="bg-white rounded-2xl p-4 mb-4 flex-row items-center">
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
              <View className="flex-1">
                <Text
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: 'SF Pro Display' }}
                  numberOfLines={1}
                >
                  {subscription.name}
                </Text>
                {subscription.planName && (
                  <Text
                    className="text-sm text-gray-600"
                    style={{ fontFamily: 'SF Pro Text' }}
                  >
                    {subscription.planName}
                  </Text>
                )}
              </View>
            </View>

            {/* Price (only for custom subscriptions) */}
            {subscription.isCustom && (
              <FormField
                label="Price"
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            )}

            {/* Next Billing Date */}
            <FormField
              label="Next Billing Date"
              value={editNextBillingDate}
              onChangeText={setEditNextBillingDate}
              placeholder="YYYY-MM-DD"
            />

            {/* Status Selector */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text
                className="text-sm font-semibold text-gray-700 mb-3"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                Status
              </Text>
              <View className="flex-row">
                {(['active', 'inactive', 'cancelled'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setEditStatus(status)}
                    className={`flex-1 mr-2 last:mr-0 py-3 rounded-xl ${
                      editStatus === status ? 'bg-blue-600' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-semibold capitalize ${
                        editStatus === status ? 'text-white' : 'text-gray-700'
                      }`}
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text
                className="text-sm font-semibold text-gray-700 mb-2"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                Notes (Optional)
              </Text>
              <TextInput
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Add any notes..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                style={{ fontFamily: 'SF Pro Text' }}
              />
            </View>

            {/* Save Button */}
            <AppleButton
              title="Save Changes"
              onPress={handleUpdateSubscription}
              disabled={loading}
              loading={loading}
              size="large"
              containerClassName="mb-6"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View className="flex-1 justify-end">
            <View 
              className="bg-white rounded-t-3xl"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <View className="px-6 pt-6 pb-4">
                <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
                
                <TouchableOpacity
                  onPress={handleEdit}
                  className="flex-row items-center py-4 border-b border-gray-100"
                >
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">✏️</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-lg font-semibold text-blue-600"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      Edit Subscription
                    </Text>
                    <Text 
                      className="text-sm text-gray-500 mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      Update price, status, or notes
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-row items-center py-4 border-b border-gray-100"
                >
                  <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">🗑️</Text>
                  </View>
                  <View className="flex-1">
                    <Text 
                      className="text-lg font-semibold text-red-600"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      Delete Subscription
                    </Text>
                    <Text 
                      className="text-sm text-gray-500 mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      Remove this subscription from your list
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowMenu(false)}
                  className="bg-gray-100 rounded-2xl py-4 mt-4"
                >
                  <Text 
                    className="text-center text-base font-semibold text-gray-700"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SubscriptionDetailScreen;
