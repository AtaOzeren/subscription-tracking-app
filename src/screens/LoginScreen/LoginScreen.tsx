import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { storageService } from '../../services/storageService';
import AppleButton from '../../components/common/AppleButton';
import AppleInput from '../../components/common/AppleInput';
import Logo from '../../components/common/Logo';
import AnimatedText from '../../components/common/AnimatedText';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Starting login for:', email);
      await login(email, password);
      console.log('✅ Login successful');
      
      // Mark onboarding as complete (Welcome -> Language -> Login completed)
      await storageService.setOnboardingComplete(true);
      console.log('✅ Onboarding marked as complete');
      
      // Check if profile setup is needed
      const profileSetup = await storageService.getProfileSetup();
      if (!profileSetup) {
        console.log('🔄 Redirecting to ProfileSetup...');
        // Navigate to ProfileSetup screen
        navigation.navigate('ProfileSetup' as never);
      } else {
        console.log('✅ Profile already setup, proceeding to main app');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert(t('auth.loginFailed'), error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-ios-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
                Sign in to your account
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
                   placeholder={t('auth.emailAddress')}
                   value={email}
                   onChangeText={(text) => {
                     setEmail(text);
                     if (errors.email) setErrors({ ...errors, email: undefined });
                   }}
                   keyboardType="email-address"
                   autoCapitalize="none"
                   autoCorrect={false}
                   error={errors.email}
                   containerClassName="mb-8"
                 />
               </View>
            </AnimatedText>

            <AnimatedText
              style={{ opacity: 0, width: '100%' }}
              delay={1150}
              duration={800}
              type="fadeInUp"
            >
               <View style={{ width: '100%' }}>
                 <AppleInput
                   placeholder={t('auth.password')}
                   value={password}
                   onChangeText={(text) => {
                     setPassword(text);
                     if (errors.password) setErrors({ ...errors, password: undefined });
                   }}
                   secureTextEntry
                   error={errors.password}
                   containerClassName="mb-8"
                 />
               </View>
            </AnimatedText>
          </View>

          {/* Sign Up Link */}
          <AnimatedText
            style={{ opacity: 0, width: '100%' }}
            delay={1300}
            duration={800}
            type="fadeIn"
          >
             <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
               <Text className="text-ios-text-secondary text-base" style={{ fontFamily: 'SF Pro Text' }}>
                 {t('auth.dontHaveAccount')}{' '}
               </Text>
               <TouchableOpacity 
                 onPress={() => navigation.navigate('Register' as never)}
                 activeOpacity={0.6}
               >
                <Text className="text-black text-base font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
                  {t('common.signUp')}
                </Text>
               </TouchableOpacity>
             </View>
          </AnimatedText>
        </View>
      </ScrollView>

      {/* Sign In Button - Fixed at Bottom */}
      <AnimatedText
        style={{ opacity: 0 }}
        delay={1450}
        duration={800}
        type="fadeInUp"
        asView={true}
      >
        <View className="absolute bottom-8 left-8 right-8">
          <AppleButton
            title={t('common.signIn')}
            onPress={handleLogin}
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

export default LoginScreen;