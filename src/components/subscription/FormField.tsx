import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required = false, 
  value, 
  onChangeText,
  ...textInputProps 
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text className="text-body-md text-text-secondary font-semibold mb-2 font-display">
        {label} {required && '*'}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-gray-50 rounded-xl px-4 py-3 text-base font-text"
        {...textInputProps}
      />
    </View>
  );
};

export default FormField;
