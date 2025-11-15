import React from 'react';
import { TextInput, View, Text, ViewStyle, TextInputProps } from 'react-native';

interface AppleInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  containerClassName?: string;
}

const AppleInput: React.FC<AppleInputProps> = ({
  label,
  error,
  containerStyle,
  containerClassName,
  style,
  ...props
}) => {
  return (
    <View className={`w-full ${containerClassName || ''}`} style={containerStyle}>
      {label && (
        <Text className="text-body-lg text-text-primary font-semibold mb-2 text-center font-display">
          {label}
        </Text>
      )}
      <TextInput
        className={`
          w-full border rounded-2xl px-4 py-3 bg-white shadow-sm 
          text-base text-center font-text
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        style={style}
        placeholderTextColor="#8E8E93"
        {...props}
      />
      {error && (
        <Text className="text-sm text-accent-error mt-1 font-text">
          {error}
        </Text>
      )}
    </View>
  );
};

export default AppleInput;
