import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storageService';
import AppleButton from '../../components/common/AppleButton';
import AppleInput from '../../components/common/AppleInput';
import Logo from '../../components/common/Logo';
import AnimatedText from '../../components/common/AnimatedText';
import ProgressIndicator from '../../components/common/ProgressIndicator';
import BackButton from '../../components/common/BackButton';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const { register } = useAuth();
  const { showError } = useError();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!name) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = t('auth.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = t('auth.validEmail');
      }
    }

    if (!password) {
      newErrors.password = t('auth.passwordRequired');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      // console.log('🔐 Starting registration for:', email);
      await register(email, password, name);
      // console.log('✅ Registration successful');

      // Mark onboarding as complete (Welcome -> Language -> Register completed)
      await storageService.setOnboardingComplete(true);
      // console.log('✅ Onboarding marked as complete');

      // Check if profile setup is needed
      const profileSetup = await storageService.getProfileSetup();
      if (!profileSetup) {
        // console.log('🔄 Redirecting to ProfileSetup...');
        // Navigate to ProfileSetup screen
        navigation.navigate('ProfileSetup' as never);
      } else {
        // console.log('✅ Profile already setup, proceeding to main app');
      }
    } catch (error) {
      console.error('[Register] Registration error:', error);
      showError(error, 'Registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-ios-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <View className="px-6 pt-4 pb-1">
        <BackButton />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo Section */}
          <View className="items-center mb-12">
            <Logo size="large" animated={true} />
            <View className="mt-8 items-center">
              <AnimatedText
                style={{
                  fontFamily: 'SF Pro Display',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#000000',
                  marginBottom: 8,
                  letterSpacing: -0.5,
                }}
                delay={600}
                duration={1000}
                type="fadeInUp"
              >
                Welcome Sub-Tracking
              </AnimatedText>
              <AnimatedText
                style={{
                  fontFamily: 'SF Pro Text',
                  fontSize: 15,
                  color: '#8E8E93',
                  textAlign: 'center',
                  letterSpacing: 0.2,
                }}
                delay={800}
                duration={1000}
                type="fadeInUp"
              >
                Sign up to get started
              </AnimatedText>
            </View>
          </View>

          {/* Form Section */}
          <View className="mb-6 w-full">
            <AnimatedText
              style={{ opacity: 0, width: '100%' }}
              delay={1000}
              duration={800}
              type="fadeInUp"
            >
              <View style={{ width: '100%' }}>
                <AppleInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  autoCapitalize="words"
                  error={errors.name}
                  containerStyle={{ marginBottom: 16, width: '100%' }}
                />
              </View>
            </AnimatedText>

            <AnimatedText
              style={{ opacity: 0, width: '100%' }}
              delay={1100}
              duration={800}
              type="fadeInUp"
            >
              <View style={{ width: '100%' }}>
                <AppleInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  containerStyle={{ marginBottom: 16, width: '100%' }}
                />
              </View>
            </AnimatedText>

            <AnimatedText
              style={{ opacity: 0, width: '100%' }}
              delay={1200}
              duration={800}
              type="fadeInUp"
            >
              <View style={{ width: '100%' }}>
                <AppleInput
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry
                  error={errors.password}
                  containerStyle={{ marginBottom: 16, width: '100%' }}
                />
              </View>
            </AnimatedText>

            <AnimatedText
              style={{ opacity: 0, width: '100%' }}
              delay={1300}
              duration={800}
              type="fadeInUp"
            >
              <View style={{ width: '100%' }}>
                <AppleInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  secureTextEntry
                  error={errors.confirmPassword}
                  containerStyle={{ marginBottom: 0, width: '100%' }}
                />
              </View>
            </AnimatedText>
          </View>

          {/* Sign In Link */}
          <AnimatedText
            style={{ opacity: 0, width: '100%' }}
            delay={1400}
            duration={800}
            type="fadeIn"
          >
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text className="text-ios-text-secondary text-base" style={{ fontFamily: 'SF Pro Text' }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login' as never)}
                activeOpacity={0.6}
              >
                <Text className="text-black text-base font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedText>
        </View>
      </ScrollView>

      {/* Progress Indicator */}
      <AnimatedText
        style={{ opacity: 0 }}
        delay={1450}
        duration={800}
        type="fadeInUp"
        asView={true}
      >
        <View className="absolute bottom-32 left-0 right-0 items-center">
          <ProgressIndicator totalSteps={4} currentStep={3} />
        </View>
      </AnimatedText>

      {/* Sign Up Button - Fixed at Bottom */}
      <AnimatedText
        style={{ opacity: 0 }}
        delay={1500}
        duration={800}
        type="fadeInUp"
        asView={true}
      >
        <View className="absolute bottom-8 left-8 right-8">
          <AppleButton
            title="Sign Up"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="large"
            style={{ width: '100%' }}
          />
        </View>
      </AnimatedText>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;