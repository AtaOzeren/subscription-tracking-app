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
  const variantClasses = {
    primary: disabled ? 'bg-gray-300' : 'bg-black',
    secondary: disabled ? 'bg-gray-100' : 'bg-gray-400',
    outline: disabled ? 'bg-transparent border-2 border-gray-300' : 'bg-transparent border-2 border-black',
    danger: disabled ? 'bg-gray-300' : 'bg-red-600',
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
          ${variantClasses[variant]}
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
