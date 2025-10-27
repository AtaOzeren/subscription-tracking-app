import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 12, paddingVertical: 8 },
      medium: { paddingHorizontal: 16, paddingVertical: 12 },
      large: { paddingHorizontal: 20, paddingVertical: 16 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: '#3B82F6' },
      secondary: { backgroundColor: '#6B7280', borderWidth: 1, borderColor: '#D1D5DB' },
      danger: { backgroundColor: '#EF4444' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      danger: { color: '#FFFFFF' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;