import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '../types/subscription';

const STORAGE_KEY = 'subscriptions';

export const storageService = {
  // Get all subscriptions
  getSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  },

  // Save a subscription
  saveSubscription: async (subscription: Subscription): Promise<void> => {
    try {
      const subscriptions = await storageService.getSubscriptions();
      const existingIndex = subscriptions.findIndex(sub => sub.id === subscription.id);
      
      if (existingIndex >= 0) {
        subscriptions[existingIndex] = subscription;
      } else {
        subscriptions.push(subscription);
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  },

  // Delete a subscription
  deleteSubscription: async (id: string): Promise<void> => {
    try {
      const subscriptions = await storageService.getSubscriptions();
      const filteredSubscriptions = subscriptions.filter(sub => sub.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSubscriptions));
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  },

  // Clear all subscriptions
  clearAllSubscriptions: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing subscriptions:', error);
      throw error;
    }
  },
};