import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
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

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'An error occurred');
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
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo Section */}
          <View className="items-center mb-20">
            <Logo size="large" />
            <View className="mt-12 items-center">
              <AnimatedText
                style={{ 
                  fontFamily: 'SF Pro Display',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#000000',
                  marginBottom: 12,
                }}
                delay={200}
                type="fadeInUp"
              >
                Welcome Sub-Tracking
              </AnimatedText>
              <AnimatedText
                style={{ 
                  fontFamily: 'SF Pro Text',
                  fontSize: 16,
                  color: '#3C3C43',
                  textAlign: 'center',
                }}
                delay={400}
                type="fadeInUp"
              >
                Sign in to your account
              </AnimatedText>
            </View>
          </View>

          {/* Form Section */}
          <View className="mb-8">
            <AppleInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              containerStyle={{ marginBottom: 24 }}
            />

            <AppleInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              secureTextEntry
              error={errors.password}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {/* Sign In Button */}
          <AppleButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="large"
            style={{ marginBottom: 24 }}
          />

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-ios-text-secondary text-base" style={{ fontFamily: 'SF Pro Text' }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register' as never)}
              activeOpacity={0.6}
            >
              <Text className="text-ios-blue text-base font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;