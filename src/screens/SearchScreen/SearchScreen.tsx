import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface SearchScreenProps {
  scrollY?: Animated.Value;
}

const SearchScreen = ({ scrollY }: SearchScreenProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={100}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={scrollY ? Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          ) : undefined}
          scrollEventThrottle={16}
        >
          <View className="p-4">
            <Text className="text-2xl font-bold text-gray-800 mb-4">
              {t('navigation.search')}
            </Text>
            
            {/* Search Input */}
            <View className="bg-white rounded-lg p-3 mb-4 shadow-sm">
              <TextInput
                className="text-gray-800 text-base"
                placeholder={t('search.searchSubscriptions')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          
            {searchQuery === '' ? (
              <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <Text className="text-gray-500 text-center py-8">
                  {t('search.startTypingToSearch')}
                </Text>
              </View>
            ) : (
              <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <Text className="text-gray-500 text-center py-8">
                  {t('search.noResultsFound')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchScreen;