import { useState, useEffect } from 'react';
import { Subscription, SubscriptionStats } from '../types/subscription';
import { storageService } from '../services/storageService';

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await storageService.getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSubscription: Subscription = {
        ...subscription,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await storageService.saveSubscription(newSubscription);
      setSubscriptions(prev => [...prev, newSubscription]);
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  };

  const updateSubscription = async (updatedSubscription: Subscription) => {
    try {
      const subscription = {
        ...updatedSubscription,
        updatedAt: new Date().toISOString(),
      };
      
      await storageService.saveSubscription(subscription);
      setSubscriptions(prev => 
        prev.map(sub => sub.id === subscription.id ? subscription : sub)
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      await storageService.deleteSubscription(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  };

  const getStats = (): SubscriptionStats => {
    const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
    
    const totalMonthly = activeSubscriptions.reduce((total, sub) => {
      switch (sub.billingCycle) {
        case 'daily':
          return total + (sub.price * 30);
        case 'weekly':
          return total + (sub.price * 4.33);
        case 'monthly':
          return total + sub.price;
        case 'yearly':
          return total + (sub.price / 12);
        default:
          return total;
      }
    }, 0);

    const totalYearly = totalMonthly * 12;

    const categoriesCount = activeSubscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMonthly,
      totalYearly,
      activeSubscriptions: activeSubscriptions.length,
      categoriesCount,
    };
  };

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getStats,
    refresh: loadSubscriptions,
  };
};