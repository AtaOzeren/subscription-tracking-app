import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Subscription } from '../../types/subscription';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: (subscription: Subscription) => void;
  onEdit?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
}

const SubscriptionCard = ({
  subscription,
  onPress,
  onEdit,
  onDelete,
}: SubscriptionCardProps) => {
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
      daily: '/day',
      weekly: '/week',
      monthly: '/month',
      yearly: '/year',
    };
    return cycles[cycle] || '';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(subscription)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={styles.subscriptionName}>
            {subscription.name}
          </Text>
          <Text style={styles.subscriptionCategory}>
            {subscription.category}
          </Text>
          <Text style={styles.subscriptionPrice}>
            {formatPrice(subscription.price, subscription.currency)}
            <Text style={styles.billingCycle}>
              {getBillingCycleText(subscription.billingCycle)}
            </Text>
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: subscription.isActive ? '#10B981' : '#EF4444' }
          ]} />
          <Text style={styles.statusText}>
            {subscription.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.nextBillingText}>
          Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  subscriptionCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  subscriptionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  billingCycle: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextBillingText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default SubscriptionCard;