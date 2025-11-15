import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { mySubscriptionsService } from '../../services/mySubscriptionsService';
import { UserSubscription } from '../../types/subscription';
import UserSubscriptionCard from '../../components/subscription/UserSubscriptionCard';
import MinimalLoader from '../../components/common/MinimalLoader';
import AddSubscriptionScreen from '../AddSubscriptionScreen/AddSubscriptionScreen';
import SubscriptionDetailScreen from '../SubscriptionDetailScreen/SubscriptionDetailScreen';

interface SubscriptionsScreenProps {
  scrollY?: Animated.Value;
}

const SubscriptionsScreen = ({ scrollY }: SubscriptionsScreenProps) => {
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<UserSubscription[]>([]);
  const [categories, setCategories] = useState<Array<{id: number, name: string, icon_url: string, count: number}>>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubscriptions();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, selectedCategory]);

  const loadSubscriptions = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        console.log('❌ User not authenticated, cannot load subscriptions');
        Alert.alert(
          t('auth.loginRequired'),
          t('auth.loginToViewSubscriptions')
        );
        return;
      }

      setLoading(true);
      console.log('🔄 Loading subscriptions for user:', user.email);
      const data = await mySubscriptionsService.getMySubscriptions();
      setSubscriptions(data);
      
      // Extract unique categories with counts
      const categoryMap = new Map();
      data.forEach(sub => {
        const key = sub.category.id;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            id: sub.category.id,
            name: sub.category.name,
            icon_url: sub.category.icon_url,
            count: 0
          });
        }
        categoryMap.get(key).count++;
      });
      
      setCategories(Array.from(categoryMap.values()));
      console.log('✅ Subscriptions loaded successfully:', data.length);
    } catch (error) {
      console.error('❌ Error in loadSubscriptions:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    if (selectedCategory === null) {
      setFilteredSubscriptions(subscriptions);
    } else {
      setFilteredSubscriptions(
        subscriptions.filter(sub => sub.category.id === selectedCategory)
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  };

  const handleDeleteSubscription = async (id: number) => {
      Alert.alert(
        t('subscriptionAlerts.deleteTitle'),
        t('subscriptionAlerts.deleteMessage', { name: 'this subscription' }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('subscriptionAlerts.deleteConfirm'),
            style: 'destructive',
            onPress: async () => {
              try {
                await mySubscriptionsService.deleteSubscription(id);
                await loadSubscriptions();
              } catch (error) {
                Alert.alert(t('common.error'), t('subscriptionAlerts.deleteError'));
              }
            }
          }
        ]
      );
  };

  const renderCategoryFilter = () => {
    const allCategories = [{ id: null, name: t('subscriptions.all'), icon_url: '', count: subscriptions.length }, ...categories];
    const halfLength = Math.ceil(allCategories.length / 2);
    const firstRow = allCategories.slice(0, halfLength);
    const secondRow = allCategories.slice(halfLength);

    const renderCategoryChip = (category: { id: number | null; name: string; icon_url: string; count: number }) => (
      <TouchableOpacity
        key={category.id || 'all'}
        onPress={() => setSelectedCategory(category.id)}
        className={`mr-2 mb-2 px-3 py-1.5 rounded-full flex-row items-center ${
          selectedCategory === category.id ? 'bg-black' : 'bg-white border border-gray-200'
        }`}
        style={{ height: 32 }}
      >
        {category.icon_url ? <Text className="text-xs mr-1">{category.icon_url}</Text> : null}
        <Text
          className={`text-sm font-semibold font-display ${
            selectedCategory === category.id ? 'text-white' : 'text-text-secondary'
          }`}
        >
          {category.name} ({category.count})
        </Text>
      </TouchableOpacity>
    );

    return (
      <View className="px-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-1"
        >
          {firstRow.map(renderCategoryChip)}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          {secondRow.map(renderCategoryChip)}
        </ScrollView>
        {/* Active Subscriptions Count */}
        <Text className="text-body-md text-text-muted mt-1 font-text">
          {t('subscriptions.activeSubscriptionsCount', { 
            count: subscriptions.length,
            plural: subscriptions.length !== 1 ? 's' : ''
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header + Category Filter - White Background */}
      <View className="bg-white pb-3">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-heading-1 text-text-primary font-display">
              {t('subscriptions.mySubscriptions')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
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
            <Text className="text-white font-semibold font-display">
              {t('common.add')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        {categories.length > 0 && renderCategoryFilter()}
      </View>

      {/* Subscriptions List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 12 }}
        onScroll={scrollY ? Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        ) : undefined}
        scrollEventThrottle={16}
      >
        {loading ? (
          <View className="bg-white rounded-2xl p-12 items-center">
            <MinimalLoader size="medium" color="#000000" />
            <Text
              className="text-text-tertiary mt-4 text-sm"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t('common.loading')}
            </Text>
          </View>
        ) : filteredSubscriptions.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Text className="text-5xl mb-4">📱</Text>
            <Text
              className="text-heading-4 text-text-primary mb-2"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {selectedCategory ? t('subscriptions.noSubscriptionsInCategory') : t('subscriptions.noSubscriptionsYet')}
            </Text>
            <Text
              className="text-body-md text-text-muted text-center"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {selectedCategory 
                ? t('subscriptions.noSubscriptionsCategoryMessage')
                : t('subscriptions.noSubscriptionsMessage')
              }
            </Text>
          </View>
        ) : (
          filteredSubscriptions.map(subscription => (
            <UserSubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onPress={() => setSelectedSubscription(subscription)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Subscription Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <AddSubscriptionScreen onClose={() => {
          setShowAddModal(false);
          onRefresh();
        }} />
      </Modal>

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <Modal
          visible={selectedSubscription !== null}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SubscriptionDetailScreen
            route={{
              params: {
                subscription: selectedSubscription,
                onDelete: async (id: number) => {
                  await handleDeleteSubscription(id);
                  setSelectedSubscription(null);
                },
                onBack: () => setSelectedSubscription(null),
                onUpdate: async () => {
                  await loadSubscriptions();
                },
              },
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;
