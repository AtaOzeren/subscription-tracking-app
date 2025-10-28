import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type WelcomeScreenNavigationProp = StackNavigationProp<any, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  
  // Animation values for logo and text
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoSlideAnim = useRef(new Animated.Value(50)).current;
  
  // Animation values for button
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations when component mounts
    const startAnimations = () => {
      // Logo and text animations
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoSlideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animation (starts after a delay)
      Animated.parallel([
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 800,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlideAnim, {
          toValue: 0,
          duration: 600,
          delay: 500,
          useNativeDriver: true,
        }),
      ]).start();
    };

    startAnimations();
  }, []);

  const handleNext = () => {
    navigation.navigate('LanguageSelection');
  };

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      {/* Logo and Text Container - Exactly Centered */}
      <Animated.View 
        className="absolute top-1/2 left-1/2 items-center"
        style={{
          opacity: logoFadeAnim,
          transform: [
            { translateY: logoSlideAnim },
            { translateX: -150 }, // Half of approximate width to center
            { translateY: -120 }  // Half of approximate height to center
          ]
        }}
      >
        {/* Logo */}
        <View className="mb-6">
          <Image
            source={require('../../../assets/logo/subscription-tracking-black.webp')}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <Text className="text-4xl font-bold text-gray-800 text-center mb-2">
          Welcome to
        </Text>
        <Text className="text-4xl font-bold text-gray-800 text-center">
          Subscription Tracker
        </Text>
      </Animated.View>

      {/* Dots Indicator */}
      <Animated.View
        className="absolute bottom-24 left-0 right-0 items-center"
        style={{
          opacity: buttonFadeAnim,
          transform: [{ translateY: buttonSlideAnim }]
        }}
      >
        <View className="flex-row gap-2">
          <View className="w-2 h-2 rounded-full border-2 border-black bg-black" />
          <View className="w-2 h-2 rounded-full border-2 border-gray-400" />
          <View className="w-2 h-2 rounded-full border-2 border-gray-400" />
          <View className="w-2 h-2 rounded-full border-2 border-gray-400" />
        </View>
      </Animated.View>

      {/* Next Button - Fixed at Bottom */}
      <Animated.View
        className="absolute bottom-8 left-8 right-8"
        style={{
          opacity: buttonFadeAnim,
          transform: [{ translateY: buttonSlideAnim }]
        }}
      >
        <TouchableOpacity
          onPress={handleNext}
          className="w-full bg-black py-4 rounded-lg items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-lg">
            Next
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;