import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { catalogService } from '../../services/catalogService';
import { Category } from '../../types/catalog';
import { useAuth } from '../../contexts/AuthContext';
import FormField from '../../components/subscription/FormField';
import CategorySelector from '../../components/subscription/CategorySelector';
import BillingCycleSelector from '../../components/subscription/BillingCycleSelector';
import AppleButton from '../../components/common/AppleButton';

interface CustomSubscriptionProps {
  onClose: () => void;
  initialSearchQuery?: string;
  categories: Category[];
}

const CustomSubscription = ({ onClose, initialSearchQuery = '', categories }: CustomSubscriptionProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Form states
  const [customName, setCustomName] = useState(initialSearchQuery);
  const [customCategoryId, setCustomCategoryId] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [customBillingCycle, setCustomBillingCycle] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate next billing date based on start date and billing cycle
  const calculateNextBillingDate = (startDateStr: string, cycle: 'weekly' | 'monthly' | 'yearly'): string => {
    const startDate = new Date(startDateStr);
    const nextDate = new Date(startDate);

    if (cycle === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (cycle === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (cycle === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    return nextDate.toISOString().split('T')[0];
  };

  // Initialize next billing date
  useEffect(() => {
    if (startDate) {
      const calculatedDate = calculateNextBillingDate(startDate, customBillingCycle);
      setNextBillingDate(calculatedDate);
    }
  }, []);

  const handleAddCustomSubscription = async () => {
    if (!customName.trim() || !customCategoryId || !customPrice) {
      Alert.alert(t('common.error'), t('form.fillRequiredFields'));
      return;
    }

    try {
      setLoading(true);
      await catalogService.addCustomSubscription({
        custom_name: customName,
        custom_category_id: customCategoryId,
        custom_price: parseFloat(customPrice),
        custom_currency: user?.currency || 'USD',
        custom_billing_cycle: customBillingCycle,
        start_date: startDate,
        next_billing_date: nextBillingDate,
        notes: notes || undefined,
      });

      Alert.alert(
        t('common.success'),
        t('subscriptionAlerts.customSubscriptionAdded'),
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View 
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
          <Text
            className="text-heading-1 text-text-primary flex-1"
            style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
          >
            {t('customSubscription.title')}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text
              className="text-base font-semibold text-gray-700"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16 }}>
        <FormField
          label={t('customSubscription.name')}
          required
          value={customName}
          onChangeText={setCustomName}
          placeholder={t('customSubscription.namePlaceholder')}
        />

        <CategorySelector
          categories={categories}
          selectedCategoryId={customCategoryId}
          onSelectCategory={setCustomCategoryId}
          required
        />

        <FormField
          label={t('subscription.price')}
          required
          value={customPrice}
          onChangeText={setCustomPrice}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <BillingCycleSelector
          selectedCycle={customBillingCycle}
          onSelectCycle={(cycle) => {
            setCustomBillingCycle(cycle);
            // Auto-calculate next billing date when cycle changes
            if (startDate) {
              const calculatedDate = calculateNextBillingDate(startDate, cycle);
              setNextBillingDate(calculatedDate);
            }
          }}
          required
        />

        <FormField
          label={t('addSubscription.startDate')}
          value={startDate}
          onChangeText={(date) => {
            setStartDate(date);
            // Auto-calculate next billing date when start date changes
            if (date && date.length === 10) { // Valid date format YYYY-MM-DD
              const calculatedDate = calculateNextBillingDate(date, customBillingCycle);
              setNextBillingDate(calculatedDate);
            }
          }}
          placeholder="YYYY-MM-DD"
        />

        <FormField
          label={t('subscription.nextBillingDate')}
          value={nextBillingDate}
          onChangeText={setNextBillingDate}
          placeholder="YYYY-MM-DD"
        />

        <FormField
          label={t('subscription.notesOptional')}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('subscription.notesPlaceholder')}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <AppleButton
          title={t('customSubscription.title')}
          onPress={handleAddCustomSubscription}
          disabled={loading}
          loading={loading}
          size="large"
          containerClassName="mb-6"
        />
      </ScrollView>
    </View>
  );
};

export default CustomSubscription;
