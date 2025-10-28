import React, { useEffect, useRef } from 'react';
import { Image, View, ViewStyle, Animated } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', style, animated = true }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const sizeStyles = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 160, height: 160 },
  };

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [animated, fadeAnim, scaleAnim]);

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View
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
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
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
      </Animated.View>
    </View>
  );
};

export default Logo;