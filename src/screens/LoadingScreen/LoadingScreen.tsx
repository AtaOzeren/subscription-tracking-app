import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import Logo from '../../components/common/Logo';

const LoadingScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Loading dots animation
    const animateDots = () => {
      Animated.loop(
        Animated.stagger(200, [
          Animated.sequence([
            Animated.timing(dotAnim1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotAnim2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(dotAnim3, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dotAnim3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    animateDots();
  }, [fadeAnim, pulseAnim, dotAnim1, dotAnim2, dotAnim3]);

  const getDotStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
    ],
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        opacity: fadeAnim,
      }}
    >
      {/* Logo with pulse animation */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          marginBottom: 40,
        }}
      >
        <Logo size="large" animated={false} />
      </Animated.View>

      {/* App Name */}
      <Text
        style={{
          fontFamily: 'SF Pro Display',
          fontSize: 32,
          fontWeight: 'bold',
          color: '#27323B',
          marginBottom: 8,
          letterSpacing: -0.5,
        }}
      >
        Sub-Tracking
      </Text>

      {/* Loading Text with Dots */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        <Text
          style={{
            fontFamily: 'SF Pro Text',
            fontSize: 16,
            color: '#8E8E93',
            letterSpacing: 0.2,
          }}
        >
          Loading
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginLeft: 4,
            width: 30,
          }}
        >
          <Animated.Text
            style={[
              {
                fontFamily: 'SF Pro Text',
                fontSize: 16,
                color: '#8E8E93',
                marginHorizontal: 2,
              },
              getDotStyle(dotAnim1),
            ]}
          >
            .
          </Animated.Text>
          <Animated.Text
            style={[
              {
                fontFamily: 'SF Pro Text',
                fontSize: 16,
                color: '#8E8E93',
                marginHorizontal: 2,
              },
              getDotStyle(dotAnim2),
            ]}
          >
            .
          </Animated.Text>
          <Animated.Text
            style={[
              {
                fontFamily: 'SF Pro Text',
                fontSize: 16,
                color: '#8E8E93',
                marginHorizontal: 2,
              },
              getDotStyle(dotAnim3),
            ]}
          >
            .
          </Animated.Text>
        </View>
      </View>

      {/* Subtle tagline */}
      <Text
        style={{
          fontFamily: 'SF Pro Text',
          fontSize: 14,
          color: '#C6C6C8',
          marginTop: 40,
          letterSpacing: 0.3,
        }}
      >
        Manage your subscriptions
      </Text>
    </Animated.View>
  );
};

export default LoadingScreen;