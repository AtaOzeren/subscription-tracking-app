import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import AppleButton from '../../components/common/AppleButton';
import ProgressIndicator from '../../components/common/ProgressIndicator';

type WelcomeScreenNavigationProp = StackNavigationProp<any, 'Welcome'>;

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();

  // Animation values for logo and text
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoSlideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;

  // Animation values for button
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Reset app only if onboarding is not complete
    const resetAppForFirstTime = async () => {
      try {
        // console.log('🔄 Checking onboarding status...');
        const onboardingComplete = await storageService.getOnboardingComplete();

        if (!onboardingComplete) {
          // console.log('🔄 Onboarding not complete, checking for existing session...');
          const token = await authService.getToken();

          if (token) {
            // console.log('🗑️ Found existing token, clearing all data...');
            // Force logout and clear all data for fresh onboarding
            await authService.forceLogout();
            // console.log('✅ App reset completed for fresh onboarding');
          } else {
            // console.log('✅ No existing session found, fresh start');
          }
        } else {
          // console.log('✅ Onboarding already complete, skipping reset');
        }
      } catch (error) {
        console.error('[Welcome] Error resetting app:', error);
      }
    };

    // Start animations when component mounts
    const startAnimations = () => {
      // Logo animation with scale and fade
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.spring(logoSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Button animation (starts after a delay)
      Animated.parallel([
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 800,
          delay: 600,
          useNativeDriver: true,
        }),
        Animated.spring(buttonSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          delay: 600,
          useNativeDriver: true,
        }),
      ]).start();
    };

    resetAppForFirstTime();
    startAnimations();
  }, []);

  const handleNext = () => {
    navigation.navigate('LanguageSelection');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Spacer for top */}
      <View className="h-16" />

      {/* Logo and Text Container - Centered in available space */}
      <View className="flex-1 justify-center items-center px-6">
        <Animated.View
          className="items-center"
          style={{
            opacity: logoFadeAnim,
            transform: [
              { translateY: logoSlideAnim },
              { scale: logoScaleAnim },
            ]
          }}
        >
          {/* Logo */}
          <View className="mb-8">
            <Image
              source={require('../../../assets/logo/subscription-tracking-black.webp')}
              className="w-40 h-40"
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <Text
            className="text-center mb-2"
            style={{
              fontFamily: 'SF Pro Display',
              fontSize: 34,
              fontWeight: 'bold',
              color: '#000000',
              letterSpacing: -0.5,
            }}
          >
            Welcome to
          </Text>
          <Text
            className="text-center mb-4"
            style={{
              fontFamily: 'SF Pro Display',
              fontSize: 34,
              fontWeight: 'bold',
              color: '#000000',
              letterSpacing: -0.5,
            }}
          >
            SubStater
          </Text>

          {/* Description Text */}
          <Text
            className="text-center px-8"
            style={{
              fontFamily: 'SF Pro Text',
              fontSize: 16,
              color: '#8E8E93',
              lineHeight: 22,
              letterSpacing: 0.1,
            }}
          >
            Track, manage, and optimize all your subscriptions in one place
          </Text>
        </Animated.View>
      </View>

      {/* Progress Indicator */}
      <Animated.View
        className="items-center mb-4"
        style={{
          opacity: buttonFadeAnim,
          transform: [{ translateY: buttonSlideAnim }]
        }}
      >
        <ProgressIndicator totalSteps={3} currentStep={1} />
      </Animated.View>

      {/* Next Button - Fixed at Bottom */}
      <Animated.View
        className="px-6 pb-6"
        style={{
          opacity: buttonFadeAnim,
          transform: [{ translateY: buttonSlideAnim }]
        }}
      >
        <AppleButton
          title="Next"
          onPress={handleNext}
          variant="primary"
          size="large"
          style={{ width: '100%' }}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;