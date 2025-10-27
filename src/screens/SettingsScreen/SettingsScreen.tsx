import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Settings
        </Text>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-lg shadow-sm mb-4">
            <Text className="text-gray-500 text-center py-8 text-base">
              Settings options will be available here
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;