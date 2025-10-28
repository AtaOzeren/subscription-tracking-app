import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const HomeScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      'Are you sure you want to logout?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              {t('home.mySubscriptions')}
            </Text>
            <Text className="text-sm text-gray-500">
              {t('home.welcomeBack', { name: user?.name || 'User' })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">{t('common.logout')}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-base text-gray-500 mb-6">
          {t('home.trackExpenses')}
        </Text>
        
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
            <Text className="text-white text-sm">{t('home.monthly')}</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
          <View className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
            <Text className="text-white text-sm">{t('home.yearly')}</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
        </View>

        {/* Subscriptions List */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            {t('home.activeSubscriptions', { count: 0 })}
          </Text>
        </View>
        
        <ScrollView className="flex-1">
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-gray-500 text-center py-8">
              {t('home.noSubscriptions')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;