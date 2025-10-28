import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, TextStyle } from 'react-native';

interface AnimatedTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  className?: string;
  delay?: number;
  duration?: number;
  type?: 'fadeInUp' | 'fadeIn' | 'slideInLeft';
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  style,
  delay = 0,
  duration = 800,
  type = 'fadeInUp',
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

  const getAnimatedStyle = (): Animated.WithAnimatedObject<TextStyle> => {
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

  return (
    <Animated.Text style={[style, getAnimatedStyle()]}>
      {children}
    </Animated.Text>
  );
};

export default AnimatedText;