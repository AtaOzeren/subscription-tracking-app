import React from 'react';
import { Image, View, ViewStyle } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', style }) => {
  const sizeStyles = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 160, height: 160 },
  };

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <View
        style={[
          sizeStyles[size],
          {
            borderRadius: 24,
            backgroundColor: '#F8F9FA',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            overflow: 'hidden',
          },
        ]}
      >
        <Image
          source={require('../../../assets/logo/subscription-tracking.png')}
          style={[
            sizeStyles[size],
            { 
              resizeMode: 'cover',
            }
          ]}
        />
      </View>
    </View>
  );
};

export default Logo;