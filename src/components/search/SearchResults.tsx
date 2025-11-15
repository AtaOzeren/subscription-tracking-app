import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CatalogSubscription } from '../../types/catalog';
import MinimalLoader from '../common/MinimalLoader';

interface SearchResultsProps {
  results: CatalogSubscription[];
  loading: boolean;
  searchQuery: string;
  onSelectSubscription: (subscription: CatalogSubscription) => void;
  fadeAnim?: Animated.Value;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  searchQuery,
  onSelectSubscription,
  fadeAnim,
}) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <MinimalLoader size="large" color="#000000" />
        <Text className="text-body-lg text-text-tertiary mt-4 font-text">
          {t('search.searching')}
        </Text>
      </View>
    );
  }

  // No results found for active search
  if (results.length === 0 && searchQuery !== '') {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🔍</Text>
        <Text className="text-heading-3 text-text-primary mb-2 font-display text-center">
          {t('search.noResults')}
        </Text>
        <Text className="text-body-md text-text-muted text-center font-text">
          {t('search.tryDifferentKeywords')}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View 
      className="flex-1"
      style={{
        opacity: fadeAnim?.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }) || 1,
      }}
    >
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-body-sm text-text-muted mb-3 mt-2 font-text">
          {searchQuery === '' 
            ? t('search.allSubscriptions', { count: results.length })
            : t('search.foundResults', { count: results.length })
          }
        </Text>
        
        {results.map((subscription, index) => (
          <TouchableOpacity
            key={subscription.id || index}
            onPress={() => onSelectSubscription(subscription)}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              {/* Subscription Logo */}
              <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center mr-3 overflow-hidden">
                {subscription.logo_url ? (
                  <Image
                    source={{ uri: subscription.logo_url }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-xl font-bold text-gray-600 font-display">
                    {subscription.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              
              {/* Subscription Info */}
              <View className="flex-1">
                <Text className="text-body-lg font-semibold text-text-primary mb-1 font-display">
                  {subscription.name}
                </Text>
                <Text className="text-body-sm text-text-muted font-text">
                  {typeof subscription.category === 'string' ? subscription.category : subscription.category?.name || ''}
                </Text>
              </View>
              
              {/* Arrow Icon */}
              <Text className="text-text-muted text-xl">›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
};
