import React from 'react';
import { View, Text, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import BackButton from '../common/BackButton';
import ProfileButton from '../common/ProfileButton';

interface SearchHeaderProps {
  onBack?: () => void;
  onProfilePress?: () => void;
  slideAnim?: Animated.Value;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onBack,
  onProfilePress,
  slideAnim,
}) => {
  const { t } = useTranslation();

  return (
    <View className="bg-white border-b border-gray-200">
      <View className="px-4 py-4 flex-row items-center justify-between">
        {/* Back Button - Animated slide in from right */}
        <Animated.View
          style={{
            opacity: slideAnim?.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            transform: slideAnim ? [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ] : [],
          }}
        >
          <BackButton onPress={onBack} />
        </Animated.View>

        {/* Search Title */}
        <View className="flex-1 items-center">
          <Text className="text-heading-2 text-text-primary font-display">
            {t('navigation.search')}
          </Text>
        </View>

        {/* Profile Button */}
        {onProfilePress && <ProfileButton onPress={onProfilePress} />}
      </View>
    </View>
  );
};
