import React from 'react';
import { View, Animated } from 'react-native';
import AddSubscriptionScreen from '../AddSubscriptionScreen/AddSubscriptionScreen';

interface SearchScreenProps {
  scrollY?: Animated.Value;
}

const SearchScreen = ({ scrollY }: SearchScreenProps) => {
  return (
    <View className="flex-1">
      <AddSubscriptionScreen onClose={() => {
        // In the tab bar context, we don't close the screen
        // User can navigate away using the tab bar
      }} />
    </View>
  );
};

export default SearchScreen;