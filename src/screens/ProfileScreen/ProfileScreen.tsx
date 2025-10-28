import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ProfileScreen = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          {t('profile.title', { defaultValue: 'Profile' })}
        </Text>
        
        <ScrollView>
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              {user?.name || 'User'}
            </Text>
            <Text className="text-gray-600 mb-1">
              {user?.email || 'No email'}
            </Text>
            <Text className="text-gray-500 text-sm">
              Role: {user?.role || 'customer'}
            </Text>
            <Text className="text-gray-500 text-sm">
              Region: {user?.region || 'N/A'}
            </Text>
            <Text className="text-gray-500 text-sm">
              Currency: {user?.currency || 'N/A'}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;