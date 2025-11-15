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

  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-30 h-30',
    large: 'w-40 h-40',
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
    <View className="items-center justify-center" style={style}>
      <Animated.View
        className={`
          ${sizeClasses[size]}
          rounded-3xl bg-gray-50 items-center justify-center
          shadow-card overflow-hidden
        `}
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Image
          source={require('../../../assets/logo/subscription-tracking-black.webp')}
          className={sizeClasses[size]}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
};

export default Logo;
