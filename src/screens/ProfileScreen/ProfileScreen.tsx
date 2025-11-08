import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { User } from '../../types/auth';
import CountryFlag from '../../components/common/CountryFlag';

interface ProfileScreenProps {
  route?: {
    params?: {
      onBack?: () => void;
    };
  };
}

const ProfileScreen = ({ route }: ProfileScreenProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user: contextUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(contextUser);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onBack = route?.params?.onBack;

  const fetchProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const profileData = await profileService.getProfile();
      setUser(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : 'Failed to fetch profile'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle', { defaultValue: 'Logout' }),
      t('profile.logoutMessage', { defaultValue: 'Are you sure you want to logout?' }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.logoutConfirm', { defaultValue: 'Logout' }),
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    fetchProfile(true);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header - Fixed at top with status bar */}
      <View
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
          {onBack && (
            <TouchableOpacity onPress={onBack}>
              <Text
                className="text-base font-semibold text-gray-700"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t('common.back')}
              </Text>
            </TouchableOpacity>
          )}
          {!onBack && <View style={{ width: 60 }} />}
          <Text
            className="text-3xl font-bold text-gray-900 flex-1 text-center"
            style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
          >
            {t('profile.title', { defaultValue: 'Profile' })}
          </Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !user ? (
          <View className="flex-1 items-center justify-center p-8">
            <Text
              className="text-base text-gray-500"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t('common.loading', { defaultValue: 'Loading...' })}
            </Text>
          </View>
        ) : (
          <>
            {/* Profile Header */}
            <View className="bg-white p-6 mb-3">
              <View className="items-center mb-4">
                {/* Avatar Circle */}
                <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-4">
                  <Text
                    className="text-4xl font-bold text-blue-600"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>

                {/* Name */}
                <Text
                  className="text-2xl font-bold text-gray-900 mb-1"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {user?.name || 'User'}
                </Text>

                {/* Email */}
                <Text
                  className="text-base text-gray-600"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {user?.email || 'No email'}
                </Text>
              </View>
            </View>

            {/* Account Information */}
            <View className="bg-white px-6 py-5 mb-3">
              <Text
                className="text-xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t('profile.accountInfo', { defaultValue: 'Account Information' })}
              </Text>

              {/* User ID */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.userId', { defaultValue: 'User ID' })}
                </Text>
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  #{user?.id || 'N/A'}
                </Text>
              </View>

              {/* Role */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.role', { defaultValue: 'Role' })}
                </Text>
                <Text
                  className="text-base font-semibold text-gray-900 capitalize"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {user?.role || 'N/A'}
                </Text>
              </View>

              {/* Email */}
              <View className="flex-row items-center justify-between py-3">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.email', { defaultValue: 'Email' })}
                </Text>
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Text' }}
                  numberOfLines={1}
                >
                  {user?.email || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Regional Settings */}
            <View className="bg-white px-6 py-5 mb-3">
              <Text
                className="text-xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t('profile.regionalSettings', { defaultValue: 'Regional Settings' })}
              </Text>

              {/* Region */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.region', { defaultValue: 'Region' })}
                </Text>
                <View className="flex-row items-center">
                  {user?.region && (
                    <View className="mr-2">
                      <CountryFlag countryCode={user.region} size={20} />
                    </View>
                  )}
                  <Text
                    className="text-base font-semibold text-gray-900"
                    style={{ fontFamily: 'SF Pro Text' }}
                  >
                    {user?.region || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Currency */}
              <View className="flex-row items-center justify-between py-3">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.currency', { defaultValue: 'Currency' })}
                </Text>
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {user?.currency || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Activity Timestamps */}
            <View className="bg-white px-6 py-5 mb-3">
              <Text
                className="text-xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t('profile.activity', { defaultValue: 'Activity' })}
              </Text>

              {/* Last Login */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.lastLogin', { defaultValue: 'Last Login' })}
                </Text>
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Text' }}
                  numberOfLines={1}
                >
                  {formatDate(user?.last_login_at)}
                </Text>
              </View>

              {/* Created At */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.createdAt', { defaultValue: 'Account Created' })}
                </Text>
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Text' }}
                  numberOfLines={1}
                >
                  {formatDate(user?.created_at)}
                </Text>
              </View>

              {/* Updated At */}
              <View className="flex-row items-center justify-between py-3">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.updatedAt', { defaultValue: 'Last Updated' })}
                </Text>
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Text' }}
                  numberOfLines={1}
                >
                  {formatDate(user?.updated_at)}
                </Text>
              </View>
            </View>

            {/* Logout Button */}
            <View className="px-4">
              <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-600 rounded-2xl py-4 items-center"
              >
                <Text
                  className="text-base font-semibold text-white"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {t('profile.logout', { defaultValue: 'Logout' })}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
