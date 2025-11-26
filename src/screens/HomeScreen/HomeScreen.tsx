import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated, Modal, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getGreetingMessage } from '../../utils/helpers';
import ProfileButton from '../../components/common/ProfileButton';
import NotificationButton from '../../components/common/NotificationButton';
import Button from '../../components/common/Button';
import { StatsCards } from '../../components/stats/StatsCards';
import MinimalSubscriptionCard from '../../components/subscription/MinimalSubscriptionCard';
import MinimalLoader from '../../components/common/MinimalLoader';
import SubscriptionDetailScreen from '../SubscriptionDetailScreen/SubscriptionDetailScreen';
import { useMySubscriptions, useDeleteSubscription, useCategories } from '../../hooks/useQueries';
import { UserSubscription } from '../../types/subscription';
import CustomSubscription from '../AddSubscriptionScreen/CustomSubscription';
import PremiumSupportButton from '../../components/common/PremiumSupportButton';

interface HomeScreenProps {
  tabBarHeight?: number;
  onNavigateToProfile?: () => void;
  onNavigateToSubscriptions?: () => void;
  onNavigateToAddSubscription?: () => void;
  scrollY?: Animated.Value;
}

const HomeScreen = ({ tabBarHeight = 100, onNavigateToProfile, onNavigateToSubscriptions, onNavigateToAddSubscription, scrollY }: HomeScreenProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [greetingMessage, setGreetingMessage] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [showCustomSubscription, setShowCustomSubscription] = useState(false);

  // Use React Query hook for subscriptions - automatic caching!
  const { data: subscriptions = [], isLoading: loading, error, refetch, isRefetching } = useMySubscriptions();
  const { data: categories = [] } = useCategories();
  const deleteSubscriptionMutation = useDeleteSubscription();

  useEffect(() => {
    if (user?.name) {
      const name = user.name.length > 5 ? user.name.substring(0, 5) + '...' : user.name;
      setGreetingMessage(getGreetingMessage(name, t));
    }
  }, [user?.name, t]);

  const handleRefresh = () => {
    refetch();
  };

  const handleProfilePress = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        contentContainerStyle={{ paddingBottom: tabBarHeight + insets.bottom + 25 }}
        onScroll={scrollY ? Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        ) : undefined}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-heading-1 text-text-primary">
                {greetingMessage || t('home.mySubscriptions')}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <NotificationButton />
              <ProfileButton onPress={handleProfilePress} />
            </View>
          </View>
        </View>

        {/* Content Area - Loading/Error/Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <MinimalLoader size="large" color="#000000" />
            <Text className="text-body-lg text-text-tertiary mt-4" style={{ fontFamily: 'SF Pro Text' }}>
              {t('common.loading')}
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-6 py-20">
            <Text className="text-body-lg text-accent-error text-center mb-4">
              {error.message || t('common.errorLoading')}
            </Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text className="text-body-lg text-accent font-semibold">
                {t('common.tryAgain')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <StatsCards
              monthlySpending={subscriptions
                .filter(sub => sub.status === 'active')
                .reduce((sum, sub) => sum + sub.price, 0)}
              currency={subscriptions.length > 0 ? subscriptions[0].currency : 'USD'}
              activeSubscriptions={subscriptions.filter(sub => sub.status === 'active').length}
              totalSubscriptions={subscriptions.length}
            />

            {/* Action Buttons */}
            <View className="px-6 mb-6">
              <PremiumSupportButton />
            </View>

            {/* Add Subscription Buttons */}
            <View className="px-6 mb-6 flex-row gap-3">
              <View className="flex-1">
                <Button
                  title={t('subscriptionActions.add')}
                  onPress={() => onNavigateToAddSubscription?.()}
                  variant="primary"
                  size="large"
                  className="rounded-xl"
                />
              </View>
              <View className="flex-1">
                <Button
                  title={t('subscriptionActions.addCustom')}
                  onPress={() => setShowCustomSubscription(true)}
                  variant="primary"
                  size="large"
                  className="rounded-xl"
                />
              </View>
            </View>

            {/* Active Subscriptions */}
            <View className="px-6 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-heading-4 text-text-primary">
                  {t('home.activeSubscriptions')}
                </Text>
                <TouchableOpacity
                  onPress={onNavigateToSubscriptions}
                  activeOpacity={0.7}
                >
                  <Text className="text-body-md font-semibold text-accent">
                    {t('home.viewAll')}
                  </Text>
                </TouchableOpacity>
              </View>
              {subscriptions
                .filter(sub => sub.status === 'active')
                .slice(0, 4)
                .map((subscription) => (
                  <MinimalSubscriptionCard
                    key={subscription.id}
                    subscription={subscription}
                    onPress={() => setSelectedSubscription(subscription)}
                  />
                ))}
            </View>
          </>
        )}
      </ScrollView>

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
                  await deleteSubscriptionMutation.mutateAsync(id);
                  setSelectedSubscription(null);
                },
                onBack: () => setSelectedSubscription(null),
                onUpdate: async () => {
                  await refetch();
                },
              },
            }}
          />
        </Modal>
      )}

      {/* Custom Subscription Modal */}
      <Modal
        visible={showCustomSubscription}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CustomSubscription
          onClose={() => setShowCustomSubscription(false)}
          categories={categories}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;
