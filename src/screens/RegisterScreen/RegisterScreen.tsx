import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AppleButton from '../../components/common/AppleButton';
import AppleInput from '../../components/common/AppleInput';
import Logo from '../../components/common/Logo';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const { register } = useAuth();
  const navigation = useNavigation();

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!name) {
      newErrors.name = 'Name is required';
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
      console.log('🔐 Starting registration for:', email);
      await register(email, password, name);
      console.log('✅ Registration successful');
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
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
          <View className="items-center mb-12">
            <Logo size="large" />
            <View className="mt-8 items-center">
              <Text className="text-3xl font-bold text-ios-text mb-2" style={{ fontFamily: 'SF Pro Display' }}>
                Welcome Sub-Tracking
              </Text>
              <Text className="text-base text-ios-text-secondary text-center" style={{ fontFamily: 'SF Pro Text' }}>
                Sign up to get started
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View className="space-y-4 mb-8">
            <AppleInput
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              autoCapitalize="words"
              error={errors.name}
            />

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
            />

            <AppleInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>

          {/* Sign Up Button */}
          <AppleButton
            title="Sign Up"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="large"
            style={{ marginBottom: 24 }}
          />

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-ios-text-secondary text-base" style={{ fontFamily: 'SF Pro Text' }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login' as never)}
              activeOpacity={0.6}
            >
              <Text className="text-ios-blue text-base font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;