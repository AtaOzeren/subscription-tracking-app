import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, Animated } from 'react-native';

interface AppleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  containerClassName?: string;
}

const AppleButton: React.FC<AppleButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  containerClassName,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // Size classes
  const sizeClasses = {
    small: 'px-4 py-2 min-h-[36px]',
    medium: 'px-6 py-3 min-h-[44px]',
    large: 'px-8 py-4 min-h-[52px]',
  };

  // Variant classes
  const getButtonStyles = () => {
    if (disabled) {
      switch (variant) {
        case 'primary':
        case 'danger':
          return 'bg-gray-300';
        case 'secondary':
          return 'bg-gray-100';
        case 'outline':
          return 'bg-transparent border-2 border-gray-300';
        default:
          return 'bg-gray-300';
      }
    } else {
      switch (variant) {
        case 'primary':
          return 'bg-tracking-blue';
        case 'secondary':
          return 'bg-gray-400';
        case 'outline':
          return 'bg-transparent border-2 border-black';
        case 'danger':
          return 'bg-red-600';
        default:
          return 'bg-tracking-blue';
      }
    }
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  // Text color classes
  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: disabled ? 'text-gray-300' : 'text-black',
    danger: 'text-white',
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }] }}
      className={containerClassName || ''}
    >
      <TouchableOpacity
        className={`
          rounded-2xl items-center justify-center
          shadow-button
          ${sizeClasses[size]}
          ${getButtonStyles()}
        `}
        style={style}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' ? '#000000' : '#FFFFFF'}
            size="small"
          />
        ) : (
          <Text
            className={`font-display font-semibold ${textSizeClasses[size]} ${textColorClasses[variant]}`}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AppleButton;
