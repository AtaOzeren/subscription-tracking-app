import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
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
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Calculate button width (accounting for padding)
  const buttonWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;

  return (
    <View className="px-4 mb-4">
      <View 
        className="bg-white rounded-full p-1 flex-row relative shadow-sm"
        onLayout={handleLayout}
      >
        {/* Animated flat white slider */}
        <Animated.View
          className="absolute bg-black rounded-full"
          style={{
            top: 4,
            bottom: 4,
            left: 4,
            width: buttonWidth,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, buttonWidth],
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
              color: viewMode === 'monthly' ? '#FFFFFF' : '#1F2937',
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
              color: viewMode === 'yearly' ? '#FFFFFF' : '#1F2937',
            }}
          >
            {t('statistics.yearly')}
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
