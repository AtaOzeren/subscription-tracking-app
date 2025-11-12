import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Animated, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getGreetingMessage } from '../../utils/helpers';
import ProfileButton from '../../components/common/ProfileButton';
import { StatsCards } from '../../components/stats/StatsCards';
import MinimalSubscriptionCard from '../../components/subscription/MinimalSubscriptionCard';
import MinimalLoader from '../../components/common/MinimalLoader';
import SubscriptionDetailScreen from '../SubscriptionDetailScreen/SubscriptionDetailScreen';
import { mySubscriptionsService } from '../../services/mySubscriptionsService';
import { UserSubscription } from '../../types/subscription';

interface HomeScreenProps {
  tabBarHeight?: number;
  onNavigateToProfile?: () => void;
  scrollY?: Animated.Value;
}

const HomeScreen = ({ tabBarHeight = 100, onNavigateToProfile, scrollY }: HomeScreenProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [greetingMessage, setGreetingMessage] = useState('');
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    // Update greeting message when user changes or every minute
    const updateGreeting = () => {
      if (user?.name) {
        setGreetingMessage(getGreetingMessage(user.name, t));
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.name, t]);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setError(null);
      const data = await mySubscriptionsService.getMySubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setError(t('common.errorLoading'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSubscriptions();
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
            refreshing={refreshing} 
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
            <ProfileButton onPress={handleProfilePress} />
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
              {error}
            </Text>
            <TouchableOpacity onPress={loadSubscriptions}>
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

            {/* Active Subscriptions */}
            <View className="px-6 mb-4">
              <Text className="text-heading-4 text-text-primary mb-3">
                {t('home.activeSubscriptions')}
              </Text>
              {subscriptions
                .filter(sub => sub.status === 'active')
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
                  await mySubscriptionsService.deleteSubscription(id);
                  setSelectedSubscription(null);
                  loadSubscriptions();
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

export default HomeScreen;
