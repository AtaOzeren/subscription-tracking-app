import React from 'react';
import { View, TextInput, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  slideAnim?: Animated.Value;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  slideAnim,
  placeholder,
}) => {
  const { t } = useTranslation();

  return (
    <Animated.View
      className="px-4 py-3"
      style={{
        opacity: slideAnim?.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: slideAnim ? [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          },
        ] : [],
      }}
    >
      <View className="bg-white rounded-2xl px-4 py-3 flex-row items-center border border-gray-200 shadow-ios-input">
        {/* Search Icon */}
        <Ionicons name="search" size={20} color="#9CA3AF" className="mr-3" />

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || t('search.searchSubscriptions')}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-base text-text-primary font-text ml-3"
          autoFocus
          returnKeyType="search"
        />

        {/* Clear button when text exists */}
        {value.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color="#9CA3AF"
            onPress={() => onChangeText('')}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </Animated.View>
  );
};
