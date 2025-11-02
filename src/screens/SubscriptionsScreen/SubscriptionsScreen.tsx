import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { catalogService } from '../../services/catalogService';
import { Category, CatalogSubscription } from '../../types/catalog';

const SubscriptionsScreen = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<CatalogSubscription[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData] = await Promise.all([
        catalogService.getCategories(),
      ]);
      setCategories(categoriesData);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const data = await catalogService.getCatalogSubscriptions(selectedCategory || undefined);
      setSubscriptions(data);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await loadSubscriptions();
    setRefreshing(false);
  };

  const handleAddSubscription = () => {
    Alert.alert('Add Subscription', 'This feature will be implemented next!');
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-3"
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      <TouchableOpacity
        onPress={() => setSelectedCategory(null)}
        className={`mr-2 px-3 py-1.5 rounded-full ${
          selectedCategory === null ? 'bg-black' : 'bg-gray-200'
        }`}
        style={{ height: 32 }}
      >
        <Text
          className={`text-sm font-semibold ${
            selectedCategory === null ? 'text-white' : 'text-gray-700'
          }`}
          style={{ fontFamily: 'SF Pro Display' }}
        >
          All
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          className={`mr-2 px-3 py-1.5 rounded-full flex-row items-center ${
            selectedCategory === category.id ? 'bg-black' : 'bg-gray-200'
          }`}
          style={{ height: 32 }}
        >
          <Text className="text-xs mr-1">{category.icon_url}</Text>
          <Text
            className={`text-sm font-semibold ${
              selectedCategory === category.id ? 'text-white' : 'text-gray-700'
            }`}
            style={{ fontFamily: 'SF Pro Display' }}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSubscriptionCard = (subscription: CatalogSubscription) => (
    <TouchableOpacity
      key={subscription.id}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center mr-4">
          {subscription.logo_url ? (
            <Image
              source={{ uri: subscription.logo_url }}
              className="w-12 h-12 rounded-lg"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-2xl">{subscription.category.icon_url}</Text>
          )}
        </View>

        <View className="flex-1">
          <Text
            className="text-lg font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            {subscription.name}
          </Text>
          <Text
            className="text-sm text-gray-500 mb-1"
            style={{ fontFamily: 'SF Pro Text' }}
            numberOfLines={2}
          >
            {subscription.description}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xs mr-1">{subscription.category.icon_url}</Text>
            <Text
              className="text-xs text-gray-400"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {subscription.category.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddSubscription}
          className="bg-black rounded-full w-10 h-10 items-center justify-center"
        >
          <Text className="text-white text-xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header + Category Filter - White Background */}
      <View className="bg-white pb-3">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
            >
              Subscriptions
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddSubscription}
            className="bg-black rounded-full px-6 py-3 flex-row items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-white text-lg font-bold mr-1">+</Text>
            <Text
              className="text-white font-semibold"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {renderCategoryFilter()}
      </View>

      {/* Subscriptions List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 12 }}
      >
        {loading ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Text
              className="text-gray-500"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t('common.loading')}...
            </Text>
          </View>
        ) : subscriptions.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Text className="text-5xl mb-4">📱</Text>
            <Text
              className="text-lg font-semibold text-gray-900 mb-2"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              No Subscriptions Found
            </Text>
            <Text
              className="text-sm text-gray-500 text-center"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {selectedCategory
                ? 'No subscriptions in this category'
                : 'Browse available subscriptions and add them to your list'}
            </Text>
          </View>
        ) : (
          subscriptions.map(renderSubscriptionCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;
