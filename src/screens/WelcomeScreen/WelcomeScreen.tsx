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
  
  // Animation values for button
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Reset app only if onboarding is not complete
    const resetAppForFirstTime = async () => {
      try {
        console.log('🔄 Checking onboarding status...');
        const onboardingComplete = await storageService.getOnboardingComplete();
        
        if (!onboardingComplete) {
          console.log('🔄 Onboarding not complete, checking for existing session...');
          const token = await authService.getToken();
          
          if (token) {
            console.log('🗑️ Found existing token, clearing all data...');
            // Force logout and clear all data for fresh onboarding
            await authService.forceLogout();
            console.log('✅ App reset completed for fresh onboarding');
          } else {
            console.log('✅ No existing session found, fresh start');
          }
        } else {
          console.log('✅ Onboarding already complete, skipping reset');
        }
      } catch (error) {
        console.error('❌ Error resetting app:', error);
      }
    };

    // Start animations when component mounts
    const startAnimations = () => {
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

    resetAppForFirstTime();
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
        <Text className="text-heading-1 text-text-primary text-center mb-2">
          Welcome to
        </Text>
        <Text className="text-heading-1 text-text-primary text-center">
          Subscription Tracker
        </Text>
      </Animated.View>

      {/* Dots Indicator */}
      <Animated.View
        className="absolute bottom-32 left-0 right-0 items-center"
        style={{
          opacity: buttonFadeAnim,
          transform: [{ translateY: buttonSlideAnim }]
        }}
      >
        <ProgressIndicator totalSteps={4} currentStep={1} />
      </Animated.View>

      {/* Next Button - Fixed at Bottom */}
      <Animated.View
        className="absolute bottom-8 left-8 right-8"
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