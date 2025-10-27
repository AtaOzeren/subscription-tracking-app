import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }: any) => {

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          My Subscriptions
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          Track your recurring expenses
        </Text>
        
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
            <Text className="text-white text-sm">Monthly</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
          <View className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
            <Text className="text-white text-sm">Yearly</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
        </View>

        {/* Subscriptions List */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            Active Subscriptions (0)
          </Text>
        </View>
        
        <ScrollView className="flex-1">
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-gray-500 text-center py-8">
              No subscriptions yet. Tap "Add" to create your first subscription.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;