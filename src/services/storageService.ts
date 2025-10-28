import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '../types/subscription';
import { User } from '../types/auth';

const STORAGE_KEY = 'subscriptions';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const LANGUAGE_KEY = 'app_language';
const LANGUAGE_SCREEN_KEY = 'has_seen_language_screen';

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

  // Token management
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  },

  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  },

  // User management
  getUser: async (): Promise<User | null> => {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  setUser: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  removeUser: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  },

  // Clear all auth data
  clearAuth: async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  },

  // Language management
  getLanguage: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(LANGUAGE_KEY);
    } catch (error) {
      console.error('Error getting language:', error);
      return null;
    }
  },

  setLanguage: async (language: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error setting language:', error);
      throw error;
    }
  },

  removeLanguage: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_KEY);
    } catch (error) {
      console.error('Error removing language:', error);
      throw error;
    }
  },

  // Language screen tracking
  getHasSeenLanguageScreen: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(LANGUAGE_SCREEN_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error getting language screen status:', error);
      return false;
    }
  },

  setHasSeenLanguageScreen: async (hasSeen: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_SCREEN_KEY, hasSeen.toString());
    } catch (error) {
      console.error('Error setting language screen status:', error);
      throw error;
    }
  },
};