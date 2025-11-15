import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ViewModeToggleProps {
  viewMode: 'monthly' | 'yearly';
  onViewModeChange: (mode: 'monthly' | 'yearly') => void;
  slideAnim: Animated.Value;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  slideAnim,
}) => {
  const { t } = useTranslation();

  return (
    <View className="px-4 mb-4">
      <View className="bg-gray-200 rounded-full p-1 flex-row relative">
        {/* Animated background slider */}
        <Animated.View
          className="absolute bg-white rounded-full shadow-sm"
          style={{
            top: 4,
            bottom: 4,
            left: 4,
            width: '48%',
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 170],
                }),
              },
            ],
          }}
        />
        
        <TouchableOpacity
          className="flex-1 py-2 rounded-full z-10"
          onPress={() => onViewModeChange('monthly')}
          activeOpacity={0.7}
        >
          <Animated.Text
            className="text-center font-semibold font-display"
            style={{ 
              color: viewMode === 'monthly' ? '#1F2937' : '#9CA3AF',
            }}
          >
            {t('statistics.monthly')}
          </Animated.Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 py-2 rounded-full z-10"
          onPress={() => onViewModeChange('yearly')}
          activeOpacity={0.7}
        >
          <Animated.Text
            className="text-center font-semibold font-display"
            style={{ 
              color: viewMode === 'yearly' ? '#1F2937' : '#9CA3AF',
            }}
          >
            {t('statistics.yearly')}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
