import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales';
import { Feather } from '@expo/vector-icons';
import { UserSubscription } from '../../types/subscription';
import { useUpdateSubscription } from '../../hooks/useQueries';
import FormField from '../../components/subscription/FormField';
import AppleButton from '../../components/common/AppleButton';
import { formatPrice } from '../../utils/currency';

interface SubscriptionDetailScreenProps {
  route?: {
    params?: {
      subscription: UserSubscription;
      onDelete: (id: number) => void;
      onBack: () => void;
      onUpdate?: () => void;
    };
  };
}

const SubscriptionDetailScreen = ({ route }: SubscriptionDetailScreenProps) => {
  const { subscription, onDelete, onBack, onUpdate } = route?.params || {};

  if (!subscription) {
    return null;
  }

  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const updateSubscriptionMutation = useUpdateSubscription();
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form states
  const [editPrice, setEditPrice] = useState(subscription.price.toString());
  const [editNextBillingDate, setEditNextBillingDate] = useState(subscription.nextBillingDate);
  const [editStatus, setEditStatus] = useState<'active' | 'cancelled' | 'expired' | 'paused'>(subscription.status);
  const [editNotes, setEditNotes] = useState(subscription.notes || '');
  const [loading, setLoading] = useState(false);

  const getBillingCycleText = (cycle: string) => {
    return t(`subscription.${cycle}` as any);
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

  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'active': return '#D1FAE5';      // Light Green
      case 'cancelled': return '#FEE2E2';   // Light Red
      case 'expired': return '#FEF3C7';     // Light Orange
      case 'paused': return '#F3F4F6';      // Light Gray
      default: return '#F3F4F6';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`subscriptionStatus.${status}` as any);
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      t('subscriptionAlerts.deleteTitle'),
      t('subscriptionAlerts.deleteMessage', { name: subscription.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('subscriptionAlerts.deleteConfirm'),
          style: 'destructive',
          onPress: () => {
            onDelete?.(subscription.id);
            onBack?.();
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
    Alert.alert(
      t('subscriptionAlerts.updateTitle'),
      t('subscriptionAlerts.updateMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('subscriptionAlerts.updateConfirm'),
          style: 'default',
          onPress: async () => {
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

              await updateSubscriptionMutation.mutateAsync({ id: subscription.id, updates });

              setShowEditModal(false);

              if (onUpdate) {
                onUpdate();
              }
              onBack?.();
            } catch (error) {
              Alert.alert(
                t('common.error'),
                error instanceof Error ? error.message : t('subscriptionAlerts.updateError')
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header - Fixed at top with status bar */}
      <View
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
          {/* Back button on left */}
          <TouchableOpacity onPress={onBack} className="w-10">
            <Text className="text-2xl text-text-secondary font-display">←</Text>
          </TouchableOpacity>

          <View className="flex-1" />

          {/* Three Dots Menu on right */}
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-heading-2 text-text-secondary font-display">⋮</Text>
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
                className="text-heading-2 text-text-primary mb-1 font-display"
                numberOfLines={2}
              >
                {subscription.name}
              </Text>

              {subscription.planName && (
                <Text className="text-body-lg text-text-tertiary mb-2 font-text">
                  {subscription.planName}
                </Text>
              )}

              <View
                className="px-3 py-1.5 rounded-full self-start"
                style={{ backgroundColor: getStatusBackground(subscription.status) }}
              >
                <Text
                  className="text-sm font-semibold font-text"
                  style={{
                    color: getStatusColor(subscription.status)
                  }}
                >
                  {getStatusLabel(subscription.status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Price Section */}
          <View className="border-t border-gray-100 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-body-lg text-text-muted font-text">
                {getBillingCycleText(subscription.billingCycle)} {t("subscription.cost")}
              </Text>
              <Text className="text-heading-3 text-tracking-blue font-display">
                {formatPrice(subscription.price, subscription.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Information */}
        <View className="bg-white px-6 py-5 mb-3">
          <Text className="text-heading-3 text-text-primary mb-4 font-display">
            {t("subscription.subscriptionInformation")}
          </Text>

          {/* Category */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text
              className="text-body-lg text-text-muted"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t("subscription.category")}
            </Text>
            <Text
              className="text-body-lg text-text-primary font-semibold"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.category.name}
            </Text>
          </View>

          {/* Billing Cycle */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text
              className="text-body-lg text-text-muted"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t("subscription.billingCycle")}
            </Text>
            <Text
              className="text-body-lg text-text-primary font-semibold"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </View>

          {/* Next Billing Date */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text
              className="text-body-lg text-text-muted"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t("subscription.nextBillingDate")}
            </Text>
            <Text
              className="text-body-lg text-text-primary font-semibold"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {new Date(subscription.nextBillingDate).toLocaleDateString(i18n.language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text
              className="text-body-lg text-text-muted"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t("subscription.price")}
            </Text>
            <Text
              className="text-base font-semibold text-tracking-blue"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {formatPrice(subscription.price, subscription.currency)}
            </Text>
          </View>

          {/* Currency */}
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <Text
              className="text-body-lg text-text-muted"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t("subscription.currency")}
            </Text>
            <Text
              className="text-body-lg text-text-primary font-semibold"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.currency}
            </Text>
          </View>

          {/* Type */}
          <View className="flex-row items-center justify-between py-3">
            <Text
              className="text-body-lg text-text-muted"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t("subscription.type")}
            </Text>
            <Text
              className="text-body-lg text-text-primary font-semibold"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.isCustom ? 'Custom' : 'Preset'}
            </Text>
          </View>
        </View>



        {/* Notes */}
        {subscription.notes && (
          <View className="bg-white px-6 py-5">
            <Text
              className="text-heading-3 text-text-primary mb-3"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t("subscription.notes")}
            </Text>
            <Text
              className="text-body-lg text-text-secondary leading-6"
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
            className="bg-gray-50 border-b border-gray-200"
            style={{ paddingTop: insets.top }}
          >
            <View className="px-4 pt-4 pb-3 flex-row items-center">
              {/* Back button on left */}
              <TouchableOpacity onPress={() => setShowEditModal(false)} className="w-10">
                <Text className="text-2xl text-text-secondary font-display">←</Text>
              </TouchableOpacity>

              {/* Title - Centered */}
              <View className="flex-1 items-center">
                <Text className="text-heading-2 text-text-primary font-display">
                  {t("subscriptionActions.edit")}
                </Text>
              </View>

              {/* Empty space on right for balance */}
              <View className="w-10" />
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
                  className="text-heading-4 text-text-primary font-display"
                  numberOfLines={1}
                >
                  {subscription.name}
                </Text>
                {subscription.planName && (
                  <Text
                    className="text-sm text-text-tertiary"
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
                label={t("subscription.price")}
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            )}

            {/* Next Billing Date */}
            <FormField
              label={t("subscription.nextBillingDate")}
              value={editNextBillingDate}
              onChangeText={setEditNextBillingDate}
              placeholder="YYYY-MM-DD"
            />

            {/* Status Selector */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text
                className="text-body-md text-text-secondary font-semibold mb-3"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t("subscription.status")}
              </Text>
              <View className="flex-row flex-wrap">
                {([
                  { value: 'active', label: t('subscriptionStatus.active') },
                  { value: 'cancelled', label: t('subscriptionStatus.cancelled') },
                  { value: 'expired', label: t('subscriptionStatus.expired') },
                  { value: 'paused', label: t('subscriptionStatus.paused') }
                ] as const).map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    onPress={() => setEditStatus(status.value)}
                    className={`w-[48%] mb-2 py-3 rounded-xl ${status.value === 'active' || status.value === 'expired' ? 'mr-2' : ''
                      } ${editStatus === status.value ? 'bg-tracking-blue' : 'bg-gray-100'
                      }`}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${editStatus === status.value ? 'text-white' : 'text-text-secondary'
                        }`}
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text
                className="text-body-md text-text-secondary font-semibold mb-2"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t("subscription.notesOptional")}
              </Text>
              <TextInput
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder={t("subscription.notesPlaceholder")}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-gray-50 rounded-xl px-4 py-3 text-base"
                style={{ fontFamily: 'SF Pro Text' }}
              />
            </View>

            {/* Save Button */}
            <AppleButton
              title={t("subscriptionActions.saveChanges")}
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
                    <Feather name="edit-2" size={20} color="#216477" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-tracking-black"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {t("subscriptionActions.edit")}
                    </Text>
                    <Text
                      className="text-body-md text-text-muted mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {t("subscriptionActions.editDescription")}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-row items-center py-4 border-b border-gray-100"
                >
                  <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
                    <Feather name="trash-2" size={20} color="#216477" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-tracking-black"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {t("subscriptionActions.delete")}
                    </Text>
                    <Text
                      className="text-body-md text-text-muted mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {t("subscriptionActions.deleteDescription")}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowMenu(false)}
                  className="bg-gray-100 rounded-2xl py-4 mt-4"
                >
                  <Text
                    className="text-center text-body-lg text-text-secondary font-semibold"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {t("common.cancel")}
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
