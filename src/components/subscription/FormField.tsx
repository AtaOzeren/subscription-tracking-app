import React from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  value,
  onChangeText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...textInputProps
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-card">
      <Text className="text-body-md text-text-secondary font-semibold mb-2 font-display">
        {label} {required && '*'}
      </Text>
      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
        {leftIcon && (
          <View className="mr-2">
            {leftIcon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          className="flex-1 text-base font-text"
          {...textInputProps}
        />
        {rightIcon && (
          onRightIconPress ? (
            <TouchableOpacity onPress={onRightIconPress} className="ml-2">
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View className="ml-2">
              {rightIcon}
            </View>
          )
        )}
      </View>
    </View>
  );
};

export default FormField;
