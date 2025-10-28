import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingScreen: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#4ECDC4" />
      <Text className="mt-4 text-gray-600 text-lg font-medium">
        Loading...
      </Text>
    </View>
  );
};

export default LoadingScreen;