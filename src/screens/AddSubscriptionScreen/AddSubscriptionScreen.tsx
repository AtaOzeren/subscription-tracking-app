import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddSubscriptionScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Add Subscription
        </Text>
        
        <ScrollView className="flex-1">
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-gray-500 text-center py-8 text-base">
              Add subscription form will be available here
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AddSubscriptionScreen;