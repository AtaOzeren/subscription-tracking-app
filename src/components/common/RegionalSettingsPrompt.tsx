import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { authService } from '../../services/authService';
import { referenceService } from '../../services/referenceService';
import { storageService } from '../../services/storageService';
import { Country, Currency } from '../../types/reference';
import AppleButton from './AppleButton';
import CountryFlag from './CountryFlag';

// Language to Country mapping
const languageToCountryMap: Record<string, string> = {
  'tr': 'TR', // Turkish → Turkey
  'en': 'US', // English → United States
  'de': 'DE', // German → Germany
  'fr': 'FR', // French → France
  'it': 'IT', // Italian → Italy
  'ru': 'RU', // Russian → Russia
};

// Country to Currency mapping
const countryToCurrencyMap: Record<string, string> = {
  'TR': 'TRY', // Turkey → Turkish Lira
  'US': 'USD', // United States → US Dollar
  'DE': 'EUR', // Germany → Euro
  'FR': 'EUR', // France → Euro
  'IT': 'EUR', // Italy → Euro
  'RU': 'RUB', // Russia → Russian Ruble
  'GB': 'GBP', // United Kingdom → British Pound
  'CN': 'CNY', // China → Chinese Yuan
  'JP': 'JPY', // Japan → Japanese Yen
  'CA': 'CAD', // Canada → Canadian Dollar
  'AU': 'AUD', // Australia → Australian Dollar
  'MX': 'MXN', // Mexico → Mexican Peso
  'BR': 'BRL', // Brazil → Brazilian Real
  'IN': 'INR', // India → Indian Rupee
  'SG': 'SGD', // Singapore → Singapore Dollar
  'AE': 'AED', // UAE → UAE Dirham
  'ZA': 'ZAR', // South Africa → South African Rand
  'SE': 'SEK', // Sweden → Swedish Krona
  'ES': 'EUR', // Spain → Euro
  'NL': 'EUR', // Netherlands → Euro
};

interface RegionalSettingsPromptProps {
  visible: boolean;
  onComplete: () => void;
  onCancel?: () => void;
}

const RegionalSettingsPrompt: React.FC<RegionalSettingsPromptProps> = ({ visible, onComplete, onCancel }) => {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const filteredCountries = React.useMemo(() => {
    if (searchText === '') {
      return countries;
    }
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [countries, searchText]);

  const filteredCurrencies = React.useMemo(() => {
    if (searchText === '') {
      return currencies;
    }
    return currencies.filter(currency =>
      currency.name.toLowerCase().includes(searchText.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [currencies, searchText]);

  const sortByPreferredCountry = (countries: Country[]): Country[] => {
    const preferredCountryCode = languageToCountryMap[currentLanguage.code];
    if (!preferredCountryCode) return countries;

    const preferredCountry = countries.find(c => c.code === preferredCountryCode);
    if (!preferredCountry) return countries;

    const otherCountries = countries.filter(c => c.code !== preferredCountryCode);
    return [preferredCountry, ...otherCountries];
  };

  const sortByPreferredCurrency = (currencies: Currency[], countryCode?: string): Currency[] => {
    const preferredCurrencyCode = countryCode
      ? countryToCurrencyMap[countryCode]
      : countryToCurrencyMap[languageToCountryMap[currentLanguage.code]];

    if (!preferredCurrencyCode) return currencies;

    const preferredCurrency = currencies.find(c => c.code === preferredCurrencyCode);
    if (!preferredCurrency) return currencies;

    const otherCurrencies = currencies.filter(c => c.code !== preferredCurrencyCode);
    return [preferredCurrency, ...otherCurrencies];
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [countriesData, currenciesData] = await Promise.all([
        referenceService.getCountries(),
        referenceService.getCurrencies()
      ]);

      // Sort countries by user's language preference
      const sortedCountries = sortByPreferredCountry(countriesData);
      const sortedCurrencies = sortByPreferredCurrency(currenciesData);

      setCountries(sortedCountries);
      setCurrencies(sortedCurrencies);
    } catch (error) {
      console.error('❌ RegionalSettingsPrompt: Error loading reference data:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('onboarding.loadError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCountry || !selectedCurrency) {
      Alert.alert(
        t('common.error'),
        t('onboarding.profileSetupRequired')
      );
      return;
    }

    try {
      setLoading(true);

      // Update user profile with selected country and currency
      await authService.updateProfile({
        region: selectedCountry.code,
        currency: selectedCurrency.code
      });

      // Mark profile setup as complete
      await storageService.setProfileSetup(true);

      // Call onComplete callback
      onComplete();

    } catch (error) {
      console.error('❌ Error saving regional settings:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('onboarding.saveError')
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCountryItem = (item: Country) => {
    return (
      <TouchableOpacity
        key={item.code}
        onPress={() => {
          setSelectedCountry(item);
          setShowCountryModal(false);
          setSearchText('');

          // Auto-sort currencies based on selected country
          const sortedCurrencies = sortByPreferredCurrency(currencies, item.code);
          setCurrencies(sortedCurrencies);
        }}
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'SF Pro Display',
              fontSize: 16,
              fontWeight: '600',
              color: '#1C1C1E',
              marginBottom: 4
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontFamily: 'SF Pro Text',
              fontSize: 14,
              color: '#8E8E93'
            }}
          >
            {item.region}
          </Text>
        </View>
        <CountryFlag countryCode={item.code} size={32} style={{ marginLeft: 12 }} />
      </TouchableOpacity>
    );
  };

  const renderCurrencyItem = (item: Currency) => (
    <TouchableOpacity
      key={item.code}
      onPress={() => {
        setSelectedCurrency(item);
        setShowCurrencyModal(false);
        setSearchText('');
      }}
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Text
        style={{
          fontFamily: 'SF Pro Display',
          fontSize: 16,
          fontWeight: '600',
          color: '#1C1C1E',
          marginBottom: 4
        }}
      >
        {item.name}
      </Text>
      <Text
        style={{
          fontFamily: 'SF Pro Text',
          fontSize: 14,
          color: '#8E8E93'
        }}
      >
        {item.code} {item.symbol}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-ios-background"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-heading-2 text-text-primary flex-1"
              style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
            >
              {t('onboarding.setupProfile')}
            </Text>
            {onCancel && (
              <TouchableOpacity onPress={onCancel}>
                <Text
                  className="text-body-lg text-text-secondary"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text
            className="text-body-md text-text-muted mt-2"
            style={{ fontFamily: 'SF Pro Text' }}
          >
            {t('onboarding.setupProfileSubtitle')}
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Country Selection */}
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-2"
              style={{
                fontFamily: 'SF Pro Display',
                fontSize: 13,
                color: '#000000',
                letterSpacing: -0.08,
              }}
            >
              {t('onboarding.country')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setShowCountryModal(true);
              }}
              className="bg-white p-4 rounded-xl border border-gray-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderColor: '#E5E5EA',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                className="text-base"
                style={{
                  fontFamily: 'SF Pro Text',
                  fontSize: 16,
                  color: selectedCountry ? '#1C1C1E' : '#8E8E93',
                  flex: 1,
                }}
              >
                {selectedCountry ? selectedCountry.name : t('onboarding.countryPlaceholder')}
              </Text>
              {selectedCountry && (
                <CountryFlag countryCode={selectedCountry.code} size={24} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          </View>

          {/* Currency Selection */}
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-2"
              style={{
                fontFamily: 'SF Pro Display',
                fontSize: 13,
                color: '#000000',
                letterSpacing: -0.08,
              }}
            >
              {t('onboarding.currency')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setShowCurrencyModal(true);
              }}
              className="bg-white p-4 rounded-xl border border-gray-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <Text
                className="text-base"
                style={{
                  fontFamily: 'SF Pro Text',
                  fontSize: 16,
                  color: selectedCurrency ? '#1C1C1E' : '#8E8E93'
                }}
              >
                {selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.code})` : t('onboarding.currencyPlaceholder')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button - Fixed at Bottom */}
        <View className="absolute bottom-8 left-8 right-8">
          <AppleButton
            title={t('common.continue')}
            onPress={handleSave}
            loading={loading}
            disabled={loading || !selectedCountry || !selectedCurrency}
            variant="primary"
            size="large"
            style={{ width: '100%' }}
          />
        </View>

        {/* Country Modal */}
        <Modal
          visible={showCountryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' }}>
              {/* Modal Header */}
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                    <Text
                      style={{
                        fontFamily: 'SF Pro Text',
                        fontSize: 16,
                        color: '#8E8E93'
                      }}
                    >
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontFamily: 'SF Pro Display',
                      fontSize: 17,
                      fontWeight: '600',
                      color: '#1C1C1E'
                    }}
                  >
                    {t('onboarding.selectCountry')}
                  </Text>
                  <View style={{ width: 60 }} />
                </View>
              </View>

              {/* Search Input */}
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }}>
                <View
                  style={{
                    backgroundColor: '#F2F2F7',
                    padding: 12,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ marginRight: 8 }}>🔍</Text>
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder={t('onboarding.searchCountry')}
                    placeholderTextColor="#8E8E93"
                    style={{
                      fontFamily: 'SF Pro Text',
                      fontSize: 16,
                      color: '#1C1C1E',
                      flex: 1
                    }}
                  />
                </View>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(renderCountryItem)
                ) : (
                  <View className="p-8 items-center">
                    <Text
                      style={{
                        fontFamily: 'SF Pro Text',
                        fontSize: 16,
                        color: '#8E8E93'
                      }}
                    >
                      {t('onboarding.noCountriesFound')}
                    </Text>
                  </View>
                )}
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
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' }}>
              {/* Modal Header */}
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                    <Text
                      style={{
                        fontFamily: 'SF Pro Text',
                        fontSize: 16,
                        color: '#8E8E93'
                      }}
                    >
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontFamily: 'SF Pro Display',
                      fontSize: 17,
                      fontWeight: '600',
                      color: '#1C1C1E'
                    }}
                  >
                    {t('onboarding.selectCurrency')}
                  </Text>
                  <View style={{ width: 60 }} />
                </View>
              </View>

              {/* Search Input */}
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' }}>
                <View
                  style={{
                    backgroundColor: '#F2F2F7',
                    padding: 12,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ marginRight: 8 }}>🔍</Text>
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder={t('onboarding.searchCurrency')}
                    placeholderTextColor="#8E8E93"
                    style={{
                      fontFamily: 'SF Pro Text',
                      fontSize: 16,
                      color: '#1C1C1E',
                      flex: 1
                    }}
                  />
                </View>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map(renderCurrencyItem)
                ) : (
                  <View className="p-8 items-center">
                    <Text
                      style={{
                        fontFamily: 'SF Pro Text',
                        fontSize: 16,
                        color: '#8E8E93'
                      }}
                    >
                      {t('onboarding.noCurrenciesFound')}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RegionalSettingsPrompt;
