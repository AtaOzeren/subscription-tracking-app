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
      // Check if we can go back before calling goBack()
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
      style={[
        {
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: '300',
          color: '#000000',
        }}
      >
        ←
      </Text>
    </TouchableOpacity>
  );
};

export default BackButton;
