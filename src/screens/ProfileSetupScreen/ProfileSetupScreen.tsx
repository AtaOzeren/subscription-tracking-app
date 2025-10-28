import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { referenceService } from '../../services/referenceService';
import { storageService } from '../../services/storageService';
import { Country, Currency } from '../../types/reference';

type ProfileSetupScreenNavigationProp = StackNavigationProp<any, 'ProfileSetup'>;

const ProfileSetupScreen = () => {
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { checkAuth } = useAuth();
  const { t } = useTranslation();
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setFilteredCountries(
      countries.filter(country => 
        country.name.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, countries]);

  useEffect(() => {
    setFilteredCurrencies(
      currencies.filter(currency => 
        currency.name.toLowerCase().includes(searchText.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText, currencies]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [countriesData, currenciesData] = await Promise.all([
        referenceService.getCountries(),
        referenceService.getCurrencies()
      ]);
      
      setCountries(countriesData);
      setCurrencies(currenciesData);
      setFilteredCountries(countriesData);
      setFilteredCurrencies(currenciesData);
    } catch (error) {
      console.error('Error loading reference data:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('profileSetup.loadError', { defaultValue: 'Failed to load data. Please try again.' })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCountry || !selectedCurrency) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('profileSetup.selectBoth', { defaultValue: 'Please select both country and currency.' })
      );
      return;
    }

    try {
      setLoading(true);
      console.log('💾 Saving profile setup...');
      
      // Update user profile with selected country and currency
      await authService.updateProfile({
        region: selectedCountry.code,
        currency: selectedCurrency.code
      });
      console.log('✅ Profile updated successfully');

      // Mark profile setup as complete
      await storageService.setProfileSetup(true);
      console.log('✅ Profile setup marked as complete');

      // Refresh auth state to trigger navigation to main app
      await checkAuth();
      console.log('✅ Auth state refreshed, navigating to main app');
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        error instanceof Error ? error.message : t('profileSetup.saveError', { defaultValue: 'Failed to save profile. Please try again.' })
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCountryItem = (item: Country) => (
    <TouchableOpacity
      key={item.code}
      onPress={() => {
        setSelectedCountry(item);
        setShowCountryModal(false);
        setSearchText('');
      }}
      className="p-4 border-b border-gray-200"
    >
      <Text className="text-base text-gray-800">{item.name}</Text>
      <Text className="text-sm text-gray-500">{item.region}</Text>
    </TouchableOpacity>
  );

  const renderCurrencyItem = (item: Currency) => (
    <TouchableOpacity
      key={item.code}
      onPress={() => {
        setSelectedCurrency(item);
        setShowCurrencyModal(false);
        setSearchText('');
      }}
      className="p-4 border-b border-gray-200"
    >
      <Text className="text-base text-gray-800">{item.name}</Text>
      <Text className="text-sm text-gray-500">{item.code} {item.symbol}</Text>
    </TouchableOpacity>
  );

  if (loading && countries.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-600">{t('common.loading', { defaultValue: 'Loading...' })}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-8">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">
            {t('profileSetup.title', { defaultValue: 'Complete Your Profile' })}
          </Text>
          <Text className="text-base text-gray-600">
            {t('profileSetup.subtitle', { defaultValue: 'Select your country and currency to get started' })}
          </Text>
        </View>

        {/* Form */}
        <ScrollView className="flex-1">
          {/* Country Selection */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {t('profileSetup.country', { defaultValue: 'Country' })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowCountryModal(true);
                setSearchText('');
              }}
              className="bg-gray-50 p-4 rounded-lg border border-gray-300"
            >
              <Text className="text-base text-gray-800">
                {selectedCountry ? selectedCountry.name : t('profileSetup.selectCountry', { defaultValue: 'Select your country' })}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Currency Selection */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {t('profileSetup.currency', { defaultValue: 'Currency' })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowCurrencyModal(true);
                setSearchText('');
              }}
              className="bg-gray-50 p-4 rounded-lg border border-gray-300"
            >
              <Text className="text-base text-gray-800">
                {selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.code})` : t('profileSetup.selectCurrency', { defaultValue: 'Select your currency' })}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || !selectedCountry || !selectedCurrency}
          className={`py-4 rounded-lg items-center mb-8 ${
            loading || !selectedCountry || !selectedCurrency
              ? 'bg-gray-300'
              : 'bg-black'
          }`}
        >
          <Text className={`font-semibold text-lg ${
            loading || !selectedCountry || !selectedCurrency
              ? 'text-gray-500'
              : 'text-white'
          }`}>
            {loading 
              ? t('common.loading', { defaultValue: 'Loading...' })
              : t('common.save', { defaultValue: 'Save' })
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                  <Text className="text-gray-600 text-base">{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold">{t('profileSetup.selectCountry', { defaultValue: 'Select Country' })}</Text>
                <View className="w-16" />
              </View>
            </View>
            
            {/* Search Input */}
            <View className="p-4 border-b border-gray-200">
              <View className="bg-gray-100 p-3 rounded-lg flex-row items-center">
                <Text className="text-gray-600 mr-2">🔍</Text>
                <Text className="text-gray-600">{t('profileSetup.searchCountry', { defaultValue: 'Search country...' })}</Text>
              </View>
            </View>

            <ScrollView className="flex-1">
              {filteredCountries.map(renderCountryItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                  <Text className="text-gray-600 text-base">{t('common.cancel', { defaultValue: 'Cancel' })}</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold">{t('profileSetup.selectCurrency', { defaultValue: 'Select Currency' })}</Text>
                <View className="w-16" />
              </View>
            </View>
            
            {/* Search Input */}
            <View className="p-4 border-b border-gray-200">
              <View className="bg-gray-100 p-3 rounded-lg flex-row items-center">
                <Text className="text-gray-600 mr-2">🔍</Text>
                <Text className="text-gray-600">{t('profileSetup.searchCurrency', { defaultValue: 'Search currency...' })}</Text>
              </View>
            </View>

            <ScrollView className="flex-1">
              {filteredCurrencies.map(renderCurrencyItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileSetupScreen;