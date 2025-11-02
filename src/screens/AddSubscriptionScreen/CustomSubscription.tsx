import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { catalogService } from '../../services/catalogService';
import { Category } from '../../types/catalog';
import { useAuth } from '../../contexts/AuthContext';

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
      Alert.alert(t('common.error'), 'Please fill all required fields');
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
        'Custom subscription added successfully!',
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
            className="text-3xl font-bold text-gray-900 flex-1"
            style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
          >
            Custom Subscription
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text
              className="text-base font-semibold text-gray-700"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16 }}>
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-semibold text-gray-700 mb-2"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Subscription Name *
          </Text>
          <TextInput
            value={customName}
            onChangeText={setCustomName}
            placeholder="e.g., Steam, Gym Membership"
            className="bg-gray-50 rounded-xl px-4 py-3 text-base"
            style={{ fontFamily: 'SF Pro Text' }}
          />
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-semibold text-gray-700 mb-2"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Category *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setCustomCategoryId(category.id)}
                className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${
                  customCategoryId === category.id ? 'bg-black' : 'bg-gray-100'
                }`}
              >
                <Text className="text-xs mr-1">{category.icon_url}</Text>
                <Text
                  className={`text-sm font-semibold ${
                    customCategoryId === category.id ? 'text-white' : 'text-gray-700'
                  }`}
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-semibold text-gray-700 mb-2"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Price *
          </Text>
          <TextInput
            value={customPrice}
            onChangeText={setCustomPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            className="bg-gray-50 rounded-xl px-4 py-3 text-base"
            style={{ fontFamily: 'SF Pro Text' }}
          />
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-semibold text-gray-700 mb-2"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Billing Cycle *
          </Text>
          <View className="flex-row">
            {(['weekly', 'monthly', 'yearly'] as const).map((cycle) => (
              <TouchableOpacity
                key={cycle}
                onPress={() => {
                  setCustomBillingCycle(cycle);
                  // Auto-calculate next billing date when cycle changes
                  if (startDate) {
                    const calculatedDate = calculateNextBillingDate(startDate, cycle);
                    setNextBillingDate(calculatedDate);
                  }
                }}
                className={`flex-1 mr-2 py-3 rounded-xl items-center ${
                  customBillingCycle === cycle ? 'bg-black' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    customBillingCycle === cycle ? 'text-white' : 'text-gray-700'
                  }`}
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-semibold text-gray-700 mb-2"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Start Date
          </Text>
          <TextInput
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
            className="bg-gray-50 rounded-xl px-4 py-3 text-base"
            style={{ fontFamily: 'SF Pro Text' }}
          />
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-semibold text-gray-700 mb-2"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Next Billing Date
          </Text>
          <TextInput
            value={nextBillingDate}
            onChangeText={setNextBillingDate}
            placeholder="YYYY-MM-DD"
            className="bg-gray-50 rounded-xl px-4 py-3 text-base"
            style={{ fontFamily: 'SF Pro Text' }}
          />
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text
            className="text-sm font-semibold text-gray-700 mb-2"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes..."
            multiline
            numberOfLines={3}
            className="bg-gray-50 rounded-xl px-4 py-3 text-base"
            style={{ fontFamily: 'SF Pro Text', textAlignVertical: 'top' }}
          />
        </View>

        <TouchableOpacity
          onPress={handleAddCustomSubscription}
          disabled={loading}
          className="bg-black rounded-2xl py-4 items-center mb-6"
        >
          <Text
            className="text-white text-lg font-semibold"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            {loading ? 'Adding...' : 'Add Custom Subscription'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CustomSubscription;
