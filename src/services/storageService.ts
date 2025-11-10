import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '../types/subscription';
import { User } from '../types/auth';

const STORAGE_KEY = 'subscriptions';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const USER_AVATAR_KEY = 'user_avatar';
const LANGUAGE_KEY = 'app_language';
const LANGUAGE_SCREEN_KEY = 'has_seen_language_screen';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const PROFILE_SETUP_KEY = 'profile_setup_complete';

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
        AsyncStorage.removeItem(USER_AVATAR_KEY),
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

  // Onboarding tracking
  getOnboardingComplete: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  },

  setOnboardingComplete: async (complete: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, complete.toString());
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  },

  // Profile setup tracking
  getProfileSetup: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(PROFILE_SETUP_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error getting profile setup status:', error);
      return false;
    }
  },

  setProfileSetup: async (setup: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(PROFILE_SETUP_KEY, setup.toString());
    } catch (error) {
      console.error('Error setting profile setup status:', error);
      throw error;
    }
  },

  // Avatar management
  getAvatar: async (): Promise<string | null> => {
    try {
      const avatar = await AsyncStorage.getItem(USER_AVATAR_KEY);
      if (avatar) {
        console.log('Avatar loaded from storage:', avatar.substring(0, 100) + '...');
      } else {
        console.log('No avatar found in storage');
      }
      return avatar;
    } catch (error) {
      console.error('Error getting avatar:', error);
      return null;
    }
  },

  setAvatar: async (avatar: string): Promise<void> => {
    try {
      if (!avatar) {
        console.warn('Attempted to save empty avatar');
        return;
      }
      
      // Log avatar type and size for debugging
      const isBase64 = avatar.startsWith('data:image');
      const size = new Blob([avatar]).size;
      console.log(`Saving avatar - Type: ${isBase64 ? 'base64' : 'URL'}, Size: ${(size / 1024).toFixed(2)}KB`);
      
      await AsyncStorage.setItem(USER_AVATAR_KEY, avatar);
      console.log('Avatar saved successfully to storage');
    } catch (error) {
      console.error('Error setting avatar:', error);
      throw error;
    }
  },

  removeAvatar: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(USER_AVATAR_KEY);
      console.log('Avatar removed from storage');
    } catch (error) {
      console.error('Error removing avatar:', error);
      throw error;
    }
  },

  // Clear all data (for debug purposes)
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  },
};