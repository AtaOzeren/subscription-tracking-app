import React from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface SubscriptionsScreenProps {
  scrollY?: Animated.Value;
}

const SubscriptionsScreen = ({ scrollY }: SubscriptionsScreenProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 pb-24">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {t('navigation.subscriptions')}
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          {t('subscriptions.manageYourSubscriptions')}
        </Text>
        
        <ScrollView 
          className="flex-1"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY || new Animated.Value(0) } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-gray-500 text-center py-8">
              {t('subscriptions.noSubscriptionsYet')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SubscriptionsScreen;