import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface BackButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * iOS-style back button for navigation
 * @param onPress - Optional custom back handler (defaults to navigation.goBack())
 * @param style - Optional additional styles
 */
const BackButton: React.FC<BackButtonProps> = ({ onPress, style }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log('Cannot go back - no previous screen in stack');
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      className="w-10 h-10 items-center justify-center"
      style={style}
    >
      <Text className="text-[28px] font-light text-black">
        ←
      </Text>
    </TouchableOpacity>
  );
};

export default BackButton;
