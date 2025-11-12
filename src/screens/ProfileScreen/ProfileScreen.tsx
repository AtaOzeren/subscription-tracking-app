import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { User } from '../../types/auth';
import CountryFlag from '../../components/common/CountryFlag';
import AppleButton from '../../components/common/AppleButton';
import MinimalLoader from '../../components/common/MinimalLoader';
import ProfileUpdateModal from './modals/ProfileUpdateModal';
import RegionalSettingsModal from './modals/RegionalSettingsModal';
import SettingsScreen from '../SettingsScreen/SettingsScreen';

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
  const { user: contextUser, checkAuth } = useAuth();
  const [user, setUser] = useState<User | null>(contextUser);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  // Menu state
  const [showMenu, setShowMenu] = useState(false);
  
  // Modal states
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [showRegionalSettingsModal, setShowRegionalSettingsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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

  // Sync local user state with context user when it changes
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setAvatarError(false); // Reset error state when user changes
    }
  }, [contextUser]);

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

  

  const handleUpdateSuccess = async () => {
    await checkAuth();
    await fetchProfile();
  };

  const onRefresh = () => {
    fetchProfile(true);
  };

  // Menu handlers
  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleProfileUpdatePress = () => {
    setShowMenu(false);
    setShowProfileUpdateModal(true);
  };

  const handleRegionalSettingsPress = () => {
    setShowMenu(false);
    setShowRegionalSettingsModal(true);
  };

  const handleSettingsPress = () => {
    setShowMenu(false);
    setShowSettingsModal(true);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
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
            {user?.name || t('profile.title', { defaultValue: 'Profile' })}
          </Text>
          {/* Three Dots Menu */}
          <TouchableOpacity
            onPress={handleMenuPress}
            className="w-10 h-10 items-center justify-center"
          >
            <Text className="text-2xl text-gray-700">⋮</Text>
          </TouchableOpacity>
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
            <MinimalLoader size="large" color="#000000" />
            <Text
              className="text-base text-gray-600 mt-6"
              style={{ fontFamily: 'SF Pro Text' }}
            >
              {t('common.loading', { defaultValue: 'Loading' })}
            </Text>
          </View>
        ) : (
          <>
            {/* Profile Header */}
            <View className="bg-white p-6 mb-3">
               <View className="flex-row items-center">
                 {/* Avatar Circle - Left */}
                 {user?.avatar && !avatarError ? (
                   <Image
                     source={{ uri: user.avatar }}
                     className="w-20 h-20 rounded-full mr-4"
                     style={{ width: 80, height: 80 }}
                     onError={(error) => {
                       console.error('ProfileScreen: Avatar image failed to load:', user.avatar, error.nativeEvent.error);
                       setAvatarError(true);
                     }}
                   />
                 ) : (
                   <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mr-4">
                     <Text
                       className="text-3xl font-bold text-blue-600"
                       style={{ fontFamily: 'SF Pro Display' }}
                     >
                       {user?.name?.charAt(0).toUpperCase() || 'U'}
                     </Text>
                   </View>
                 )}

                 {/* Name and Email - Right */}
                 <View className="flex-1">
                   <Text
                     className="text-xl font-bold text-gray-900 mb-1"
                     style={{ fontFamily: 'SF Pro Display' }}
                   >
                     {user?.name || 'User'}
                   </Text>
                   <Text
                     className="text-base text-gray-600"
                     style={{ fontFamily: 'SF Pro Text' }}
                   >
                     {user?.email || 'No email'}
                   </Text>
                 </View>
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
               <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
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

               {/* Subscription Count */}
               <View className="flex-row items-center justify-between py-3">
                 <Text
                   className="text-base text-gray-500"
                   style={{ fontFamily: 'SF Pro Text' }}
                 >
                   {t('profile.subscriptionCount', { defaultValue: 'Subscriptions' })}
                 </Text>
                 <Text
                   className="text-base font-semibold text-gray-900"
                   style={{ fontFamily: 'SF Pro Text' }}
                 >
                   {user?.subscription_count || 0}
                 </Text>
               </View>
             </View>

                      </>
        )}
      </ScrollView>

      {/* Account Created - Fixed Bottom */}
      <View 
        className="bg-gray-50 px-6 py-4"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="items-center">
          <Text
            className="text-sm text-gray-500 mb-2"
            style={{ fontFamily: 'SF Pro Text' }}
          >
            {t('profile.createdAt', { defaultValue: 'Account Created' })}
          </Text>
          <Text
            className="text-sm text-gray-500"
            style={{ fontFamily: 'SF Pro Text' }}
          >
            {formatDate(user?.created_at)}
          </Text>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View className="flex-1 justify-end">
            <View
              className="bg-white rounded-t-3xl"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <View className="px-6 pt-6 pb-4">
                <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

                {/* Profile Update */}
                <TouchableOpacity
                  onPress={handleProfileUpdatePress}
                  className="flex-row items-center py-4 border-b border-gray-100"
                >
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl text-gray-900">✎</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {t('profile.profileUpdate', { defaultValue: 'Profile Update' })}
                    </Text>
                    <Text
                      className="text-sm text-gray-500 mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {t('profile.updateNameDescription', { defaultValue: 'Update your name' })}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Regional Settings */}
                <TouchableOpacity
                  onPress={handleRegionalSettingsPress}
                  className="flex-row items-center py-4 border-b border-gray-100"
                >
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl text-gray-900">⚑</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {t('profile.regionalSettings', { defaultValue: 'Regional Settings' })}
                    </Text>
                    <Text
                      className="text-sm text-gray-500 mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {t('profile.updateRegionalDescription', { defaultValue: 'Update region and currency' })}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Settings */}
                <TouchableOpacity
                  onPress={handleSettingsPress}
                  className="flex-row items-center py-4"
                >
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl text-gray-900">⚙</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {t('profile.settings', { defaultValue: 'Settings' })}
                    </Text>
                    <Text
                      className="text-sm text-gray-500 mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {t('profile.settingsDescription', { defaultValue: 'App settings and preferences' })}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowMenu(false)}
                  className="bg-gray-100 rounded-2xl py-4 mt-4"
                >
                  <Text
                    className="text-center text-base font-semibold text-gray-700"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Update Modal */}
      <ProfileUpdateModal
        visible={showProfileUpdateModal}
        onClose={() => setShowProfileUpdateModal(false)}
        currentName={user?.name || ''}
        currentRegion={user?.region}
        currentCurrency={user?.currency}
        currentAvatar={user?.avatar}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Regional Settings Modal */}
      <RegionalSettingsModal
        visible={showRegionalSettingsModal}
        onClose={() => setShowRegionalSettingsModal(false)}
        currentName={user?.name}
        currentRegion={user?.region}
        currentCurrency={user?.currency}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SettingsScreen onClose={() => setShowSettingsModal(false)} />
      </Modal>
    </View>
  );
};

export default ProfileScreen;
