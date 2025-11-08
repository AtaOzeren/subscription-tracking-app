import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { referenceService } from '../../services/referenceService';
import { User } from '../../types/auth';
import { Country, Currency } from '../../types/reference';
import CountryFlag from '../../components/common/CountryFlag';
import AppleButton from '../../components/common/AppleButton';
import FormField from '../../components/subscription/FormField';

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
  const { user: contextUser, logout, checkAuth } = useAuth();
  const [user, setUser] = useState<User | null>(contextUser);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Menu state
  const [showMenu, setShowMenu] = useState(false);
  
  // Profile Update Modal state
  const [showProfileUpdateModal, setShowProfileUpdateModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Regional Settings Modal state
  const [showRegionalSettingsModal, setShowRegionalSettingsModal] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [loadingReference, setLoadingReference] = useState(false);
  const [updatingRegionalSettings, setUpdatingRegionalSettings] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

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

  // Menu handlers
  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleProfileUpdatePress = () => {
    setShowMenu(false);
    setEditName(user?.name || '');
    setShowProfileUpdateModal(true);
  };

  const handleRegionalSettingsPress = async () => {
    setShowMenu(false);
    setSelectedCountry(user?.region || '');
    setSelectedCurrency(user?.currency || '');
    
    // Fetch countries and currencies
    setLoadingReference(true);
    try {
      const [countriesData, currenciesData] = await Promise.all([
        referenceService.getCountries(),
        referenceService.getCurrencies(),
      ]);
      setCountries(countriesData.filter(c => c.deleted_at === null));
      setCurrencies(currenciesData.filter(c => c.deleted_at === null));
    } catch (error) {
      console.error('Error fetching reference data:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : 'Failed to fetch reference data'
      );
    } finally {
      setLoadingReference(false);
    }
    
    setShowRegionalSettingsModal(true);
  };

  // Profile Update handlers
  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      Alert.alert(t('common.error'), 'Name is required');
      return;
    }

    Alert.alert(
      t('profile.updateProfileTitle', { defaultValue: 'Update Profile' }),
      t('profile.updateProfileMessage', { defaultValue: 'Are you sure you want to update your profile?' }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.save'),
          style: 'default',
          onPress: async () => {
            try {
              setUpdatingProfile(true);
              
              await profileService.updateProfile({
                name: editName.trim(),
                region: user?.region,
                currency: user?.currency,
              });
              
              setShowProfileUpdateModal(false);
              
              // Refresh profile and auth context
              await checkAuth();
              await fetchProfile();
              
              Alert.alert(
                t('common.success'),
                t('profile.updateSuccess', { defaultValue: 'Profile updated successfully' })
              );
            } catch (error) {
              console.error('Error updating profile:', error);
              Alert.alert(
                t('common.error'),
                error instanceof Error ? error.message : 'Failed to update profile'
              );
            } finally {
              setUpdatingProfile(false);
            }
          },
        },
      ]
    );
  };

  // Regional Settings handlers
  const handleUpdateRegionalSettings = async () => {
    if (!selectedCountry || !selectedCurrency) {
      Alert.alert(t('common.error'), 'Please select both country and currency');
      return;
    }

    Alert.alert(
      t('profile.updateRegionalTitle', { defaultValue: 'Update Regional Settings' }),
      t('profile.updateRegionalMessage', { defaultValue: 'Are you sure you want to update your regional settings?' }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.save'),
          style: 'default',
          onPress: async () => {
            try {
              setUpdatingRegionalSettings(true);
              
              await profileService.updateProfile({
                name: user?.name,
                region: selectedCountry,
                currency: selectedCurrency,
              });
              
              setShowRegionalSettingsModal(false);
              
              // Refresh profile and auth context
              await checkAuth();
              await fetchProfile();
              
              Alert.alert(
                t('common.success'),
                t('profile.regionalUpdateSuccess', { defaultValue: 'Regional settings updated successfully' })
              );
            } catch (error) {
              console.error('Error updating regional settings:', error);
              Alert.alert(
                t('common.error'),
                error instanceof Error ? error.message : 'Failed to update regional settings'
              );
            } finally {
              setUpdatingRegionalSettings(false);
            }
          },
        },
      ]
    );
  };

  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country?.name || code;
  };

  const getCurrencyName = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? `${currency.name} (${currency.symbol})` : code;
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
              <View className="flex-row items-center">
                {/* Avatar Circle - Left */}
                <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mr-4">
                  <Text
                    className="text-3xl font-bold text-blue-600"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>

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

            {/* Account Created - Centered */}
            <View className="bg-white px-6 py-5 mb-3">
              <View className="items-center">
                <Text
                  className="text-base text-gray-500 mb-2"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('profile.createdAt', { defaultValue: 'Account Created' })}
                </Text>
                <Text
                  className="text-lg font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {formatDate(user?.created_at)}
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
                  <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">✏️</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-blue-600"
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
                  <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">🌍</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-green-600"
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

                {/* Settings - Disabled */}
                <TouchableOpacity
                  disabled
                  className="flex-row items-center py-4 opacity-50"
                >
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">⚙️</Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-lg font-semibold text-gray-600"
                      style={{ fontFamily: 'SF Pro Display' }}
                    >
                      {t('profile.settings', { defaultValue: 'Settings' })}
                    </Text>
                    <Text
                      className="text-sm text-gray-500 mt-0.5"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {t('common.comingSoon', { defaultValue: 'Coming Soon' })}
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
      <Modal
        visible={showProfileUpdateModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View
            className="bg-white border-b border-gray-200"
            style={{ paddingTop: insets.top }}
          >
            <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowProfileUpdateModal(false)}>
                <Text
                  className="text-base font-semibold text-gray-700"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <Text
                className="text-3xl font-bold text-gray-900 flex-1 text-center"
                style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
              >
                {t('profile.profileUpdate', { defaultValue: 'Profile Update' })}
              </Text>
              <View style={{ width: 60 }} />
            </View>
          </View>

          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
            {/* Name Field */}
            <FormField
              label={t('profile.name', { defaultValue: 'Name' })}
              value={editName}
              onChangeText={setEditName}
              placeholder={t('profile.namePlaceholder', { defaultValue: 'Enter your name' })}
            />

            {/* Save Button */}
            <AppleButton
              title={t('common.save', { defaultValue: 'Save' })}
              onPress={handleUpdateProfile}
              disabled={updatingProfile}
              loading={updatingProfile}
              size="large"
              containerClassName="mb-6"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Regional Settings Modal */}
      <Modal
        visible={showRegionalSettingsModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View
            className="bg-white border-b border-gray-200"
            style={{ paddingTop: insets.top }}
          >
            <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowRegionalSettingsModal(false)}>
                <Text
                  className="text-base font-semibold text-gray-700"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <Text
                className="text-3xl font-bold text-gray-900 flex-1 text-center"
                style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
              >
                {t('profile.regionalSettings', { defaultValue: 'Regional Settings' })}
              </Text>
              <View style={{ width: 60 }} />
            </View>
          </View>

          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
            {loadingReference ? (
              <View className="items-center justify-center p-8">
                <Text
                  className="text-base text-gray-500"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('common.loading', { defaultValue: 'Loading...' })}
                </Text>
              </View>
            ) : (
              <>
                {/* Country Selector */}
                <View className="bg-white rounded-2xl p-4 mb-4">
                  <Text
                    className="text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {t('profile.region', { defaultValue: 'Region' })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCountryPicker(true)}
                    className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text
                      className="text-base text-gray-900"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {selectedCountry ? getCountryName(selectedCountry) : t('profile.selectRegion', { defaultValue: 'Select Region' })}
                    </Text>
                    <Text className="text-gray-400">›</Text>
                  </TouchableOpacity>
                </View>

                {/* Currency Selector */}
                <View className="bg-white rounded-2xl p-4 mb-4">
                  <Text
                    className="text-sm font-semibold text-gray-700 mb-2"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {t('profile.currency', { defaultValue: 'Currency' })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCurrencyPicker(true)}
                    className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
                  >
                    <Text
                      className="text-base text-gray-900"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {selectedCurrency ? getCurrencyName(selectedCurrency) : t('profile.selectCurrency', { defaultValue: 'Select Currency' })}
                    </Text>
                    <Text className="text-gray-400">›</Text>
                  </TouchableOpacity>
                </View>

                {/* Save Button */}
                <AppleButton
                  title={t('common.save', { defaultValue: 'Save' })}
                  onPress={handleUpdateRegionalSettings}
                  disabled={updatingRegionalSettings}
                  loading={updatingRegionalSettings}
                  size="large"
                  containerClassName="mb-6"
                />
              </>
            )}
          </ScrollView>

          {/* Country Picker Modal - Inside Regional Settings */}
          <Modal
            visible={showCountryPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCountryPicker(false)}
          >
            <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
                {/* Modal Header */}
                <View className="p-4 border-b border-gray-200">
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                      <Text className="text-gray-600 text-base" style={{ fontFamily: 'SF Pro Text' }}>
                        {t('common.cancel')}
                      </Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold" style={{ fontFamily: 'SF Pro Display' }}>
                      {t('profile.selectRegion', { defaultValue: 'Select Region' })}
                    </Text>
                    <View style={{ width: 60 }} />
                  </View>
                </View>

                {/* Country List */}
                <ScrollView className="p-4">
                  {countries.map((country, index) => (
                    <TouchableOpacity
                      key={country.code}
                      onPress={() => {
                        setSelectedCountry(country.code);
                        setShowCountryPicker(false);
                      }}
                      className={`p-4 rounded-xl ${index < countries.length - 1 ? 'mb-2' : ''}`}
                      style={{
                        backgroundColor: selectedCountry === country.code ? '#EBF5FF' : '#F9FAFB',
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          <CountryFlag countryCode={country.code} size={24} />
                          <Text
                            className="text-base font-semibold text-gray-900 ml-3"
                            style={{ fontFamily: 'SF Pro Text' }}
                          >
                            {country.name}
                          </Text>
                        </View>
                        {selectedCountry === country.code && (
                          <Text className="text-blue-600 text-xl">✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Currency Picker Modal - Inside Regional Settings */}
          <Modal
            visible={showCurrencyPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCurrencyPicker(false)}
          >
            <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
                {/* Modal Header */}
                <View className="p-4 border-b border-gray-200">
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                      <Text className="text-gray-600 text-base" style={{ fontFamily: 'SF Pro Text' }}>
                        {t('common.cancel')}
                      </Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold" style={{ fontFamily: 'SF Pro Display' }}>
                      {t('profile.selectCurrency', { defaultValue: 'Select Currency' })}
                    </Text>
                    <View style={{ width: 60 }} />
                  </View>
                </View>

                {/* Currency List */}
                <ScrollView className="p-4">
                  {currencies.map((currency, index) => (
                    <TouchableOpacity
                      key={currency.code}
                      onPress={() => {
                        setSelectedCurrency(currency.code);
                        setShowCurrencyPicker(false);
                      }}
                      className={`p-4 rounded-xl ${index < currencies.length - 1 ? 'mb-2' : ''}`}
                      style={{
                        backgroundColor: selectedCurrency === currency.code ? '#EBF5FF' : '#F9FAFB',
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text
                            className="text-base font-semibold text-gray-900"
                            style={{ fontFamily: 'SF Pro Text' }}
                          >
                            {currency.name}
                          </Text>
                          <Text
                            className="text-sm text-gray-500"
                            style={{ fontFamily: 'SF Pro Text' }}
                          >
                            {currency.code} ({currency.symbol})
                          </Text>
                        </View>
                        {selectedCurrency === currency.code && (
                          <Text className="text-blue-600 text-xl">✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
