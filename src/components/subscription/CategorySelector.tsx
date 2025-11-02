import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Category } from '../../types/catalog';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number) => void;
  label?: string;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  label = 'Category',
  required = false,
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text
        className="text-sm font-semibold text-gray-700 mb-2"
        style={{ fontFamily: 'SF Pro Display' }}
      >
        {label} {required && '*'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelectCategory(category.id)}
            className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${
              selectedCategoryId === category.id ? 'bg-black' : 'bg-gray-100'
            }`}
          >
            <Text className="text-xs mr-1">{category.icon_url}</Text>
            <Text
              className={`text-sm font-semibold ${
                selectedCategoryId === category.id ? 'text-white' : 'text-gray-700'
              }`}
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategorySelector;
