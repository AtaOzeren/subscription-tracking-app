import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
}: ButtonProps) => {
  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-5 py-4',
  };

  const variantClasses = {
    primary: 'bg-tracking-blue',
    secondary: 'bg-white border border-black',
    danger: 'bg-red-500',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-tracking-black',
    danger: 'text-white',
  };

  return (
    <TouchableOpacity
      className={`rounded-lg items-center justify-center ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text className={`font-semibold ${textColorClasses[variant]} ${textSizeClasses[size]}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;