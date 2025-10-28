import React from 'react';
import { TextInput, View, Text, ViewStyle, TextInputProps, TextStyle } from 'react-native';

interface AppleInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const AppleInput: React.FC<AppleInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const inputStyle: ViewStyle = {
    borderWidth: 1,
    borderColor: error ? '#FF3B30' : '#C6C6C8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  };

  const inputTextStyle: TextStyle = {
    fontSize: 16,
    fontFamily: 'SF Pro Text',
    textAlign: 'center',
  };

  const labelStyle: TextStyle = {
    fontSize: 16,
    fontFamily: 'SF Pro Display',
    fontWeight: '600' as const,
    color: '#000000',
    marginBottom: 8,
  };

  const errorStyle: TextStyle = {
    fontSize: 14,
    fontFamily: 'SF Pro Text',
    color: '#FF3B30',
    marginTop: 4,
  };

  return (
    <View style={containerStyle}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <TextInput
        style={[inputStyle, inputTextStyle, style]}
        placeholderTextColor="#8E8E93"
        {...props}
      />
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

export default AppleInput;