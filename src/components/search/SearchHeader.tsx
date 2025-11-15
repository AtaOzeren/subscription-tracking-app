import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import ProfileButton from '../common/ProfileButton';

interface SearchHeaderProps {
  onProfilePress?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onProfilePress,
}) => {
  const { t } = useTranslation();

  return (
    <View className="bg-white border-b border-gray-200">
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        {/* Search Title - Aligned to left */}
        <Text className="text-heading-1 text-text-primary font-display">
          {t('navigation.search')}
        </Text>

        {/* Profile Button */}
        {onProfilePress && <ProfileButton onPress={onProfilePress} />}
      </View>
    </View>
  );
};
