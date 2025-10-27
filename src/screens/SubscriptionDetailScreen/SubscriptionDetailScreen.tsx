import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SubscriptionDetailScreen = ({ route, navigation }: any) => {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Subscription Details
        </Text>
        
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-gray-500 text-center py-8 text-base">
            No subscription selected
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionDetailScreen;