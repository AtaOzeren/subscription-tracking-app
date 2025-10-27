import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import SubscriptionCard from '../../components/subscription/SubscriptionCard';

const HomeScreen = ({ navigation }: any) => {
  const { subscriptions, loading, getStats } = useSubscriptions();
  const stats = getStats();

  const handleSubscriptionPress = (subscription: any) => {
    navigation.navigate('SubscriptionDetail', { subscription });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Subscriptions</Text>
        <Text style={styles.subtitle}>Track your recurring expenses</Text>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly</Text>
            <Text style={styles.statValue}>
              ${stats.totalMonthly.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardRight]}>
            <Text style={styles.statLabel}>Yearly</Text>
            <Text style={styles.statValue}>
              ${stats.totalYearly.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Subscriptions List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            Active Subscriptions ({stats.activeSubscriptions})
          </Text>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {subscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No subscriptions yet. Tap "Add" to create your first subscription.
              </Text>
            </View>
          ) : (
            subscriptions
              .filter(sub => sub.isActive)
              .map(subscription => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onPress={handleSubscriptionPress}
                />
              ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginRight: 8,
  },
  statCardRight: {
    backgroundColor: '#10B981',
    marginRight: 0,
    marginLeft: 8,
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#6B7280',
  },
});

export default HomeScreen;