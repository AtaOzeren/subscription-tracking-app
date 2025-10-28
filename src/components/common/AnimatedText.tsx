import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, TextStyle, ViewStyle } from 'react-native';

interface AnimatedTextProps {
  children: React.ReactNode;
  style?: TextStyle | ViewStyle;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fadeInUp' | 'fadeIn' | 'slideInLeft';
  asView?: boolean;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  style,
  className,
  delay = 0,
  duration = 800,
  type = 'fadeInUp',
  asView = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(30)).current;
  const translateXAnim = useRef(new Animated.Value(-20)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      let animation: Animated.CompositeAnimation;
      
      switch (type) {
        case 'fadeInUp':
          animation = Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]);
          break;
        case 'fadeIn':
          animation = Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          });
          break;
        case 'slideInLeft':
          animation = Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(translateXAnim, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ]);
          break;
        default:
          animation = Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          });
      }
      
      animation.start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, type, fadeAnim, translateYAnim, translateXAnim]);

  const getAnimatedStyle = (): any => {
    const baseStyle = {
      opacity: fadeAnim,
    };

    switch (type) {
      case 'fadeInUp':
        return {
          ...baseStyle,
          transform: [{ translateY: translateYAnim }],
        };
      case 'slideInLeft':
        return {
          ...baseStyle,
          transform: [{ translateX: translateXAnim }],
        };
      default:
        return baseStyle;
    }
  };

  if (asView) {
    return (
      <Animated.View style={[style, getAnimatedStyle()]} className={className}>
        {children}
      </Animated.View>
    );
  }

  return (
    <Animated.Text style={[style, getAnimatedStyle()]} className={className}>
      {children}
    </Animated.Text>
  );
};

export default AnimatedText;