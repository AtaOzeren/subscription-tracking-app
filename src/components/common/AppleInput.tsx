import React from 'react';
import { TextInput, View, Text, ViewStyle, TextInputProps, TextStyle } from 'react-native';

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
        <Text className="text-base font-semibold text-black mb-2 text-center" style={{ fontFamily: 'SF Pro Display' }}>
          {label}
        </Text>
      )}
      <TextInput
        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-2xl px-4 py-3 bg-white shadow-sm text-base text-center`}
        style={{ fontFamily: 'SF Pro Text', ...(style as any) }}
        placeholderTextColor="#8E8E93"
        {...props}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-1" style={{ fontFamily: 'SF Pro Text' }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default AppleInput;