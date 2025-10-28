import React from 'react';
import { View, Text, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface StatisticsScreenProps {
  scrollY?: Animated.Value;
}

const StatisticsScreen = ({ scrollY }: StatisticsScreenProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4" style={{ paddingBottom: 125 }}>
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {t('navigation.statistics')}
        </Text>
        <Text className="text-base text-gray-500 mb-6">
          {t('statistics.viewYourSpending')}
        </Text>
        
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
            <Text className="text-white text-sm">{t('statistics.monthly')}</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
          <View className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
            <Text className="text-white text-sm">{t('statistics.yearly')}</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
        </View>
        
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
              {t('statistics.noDataAvailable')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default StatisticsScreen;