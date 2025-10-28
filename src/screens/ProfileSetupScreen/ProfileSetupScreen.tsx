import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { authService } from '../../services/authService';
import { referenceService } from '../../services/referenceService';
import { storageService } from '../../services/storageService';
import { Country, Currency } from '../../types/reference';
import Logo from '../../components/common/Logo';
import AnimatedText from '../../components/common/AnimatedText';
import AppleButton from '../../components/common/AppleButton';

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

const ProfileSetupScreen = () => {
  const { checkAuth } = useAuth();
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
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);

  // Convert country code to flag emoji
  const getCountryFlag = (countryCode: string): string => {
    // Unicode flag emoji: Regional Indicator Symbol Letter
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchText === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country => 
        country.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
    console.log('🔍 Filtered countries:', filteredCountries.length);
  }, [searchText, countries]);

  useEffect(() => {
    if (searchText === '') {
      setFilteredCurrencies(currencies);
    } else {
      const filtered = currencies.filter(currency => 
        currency.name.toLowerCase().includes(searchText.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCurrencies(filtered);
    }
    console.log('🔍 Filtered currencies:', filteredCurrencies.length);
  }, [searchText, currencies]);

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
      console.log('🔄 ProfileSetup: Loading countries and currencies...');
      console.log('🌍 Current language:', currentLanguage.code);
      
      const [countriesData, currenciesData] = await Promise.all([
        referenceService.getCountries(),
        referenceService.getCurrencies()
      ]);
      
      console.log('✅ ProfileSetup: Countries loaded:', countriesData.length);
      console.log('✅ ProfileSetup: Currencies loaded:', currenciesData.length);
      
      // Sort countries by user's language preference
      const sortedCountries = sortByPreferredCountry(countriesData);
      const sortedCurrencies = sortByPreferredCurrency(currenciesData);
      
      console.log('🔝 Preferred country moved to top:', sortedCountries[0]?.code);
      console.log('🔝 Preferred currency moved to top:', sortedCurrencies[0]?.code);
      
      setCountries(sortedCountries);
      setCurrencies(sortedCurrencies);
      setFilteredCountries(sortedCountries);
      setFilteredCurrencies(sortedCurrencies);
      
      console.log('✅ ProfileSetup: Data set to state successfully');
    } catch (error) {
      console.error('❌ ProfileSetup: Error loading reference data:', error);
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
        t('common.error'),
        error instanceof Error ? error.message : t('onboarding.saveError')
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCountryItem = (item: Country) => {
    console.log('🎨 Rendering country item:', item.name);
    const flag = getCountryFlag(item.code);
    
    return (
      <TouchableOpacity
        key={item.code}
        onPress={() => {
          console.log('👆 Country selected:', item.name, item.code);
          setSelectedCountry(item);
          setShowCountryModal(false);
          setSearchText('');
          
          // Auto-sort currencies based on selected country
          const sortedCurrencies = sortByPreferredCurrency(currencies, item.code);
          setFilteredCurrencies(sortedCurrencies);
          setCurrencies(sortedCurrencies);
          console.log('💱 Currencies re-sorted for country:', item.code, '→', sortedCurrencies[0]?.code);
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
        <Text style={{ fontSize: 32, marginLeft: 12 }}>
          {flag}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCurrencyItem = (item: Currency) => (
    <TouchableOpacity
      key={item.code}
      onPress={() => {
        console.log('👆 Currency selected:', item.name);
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

  if (loading && countries.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-ios-background justify-center items-center">
        <Text 
          className="text-gray-600"
          style={{ 
            fontFamily: 'SF Pro Text',
            fontSize: 16,
            color: '#8E8E93'
          }}
        >
          {t('common.loading')}
        </Text>
      </SafeAreaView>
    );
  }

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
            <Logo size="medium" animated={true} />
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
                {t('onboarding.setupProfile')}
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
                {t('onboarding.setupProfileSubtitle')}
              </AnimatedText>
            </View>
          </View>

          {/* Form Fields */}
          <View className="w-full mb-8">
            {/* Country Selection */}
            <AnimatedText
              className="w-full mb-6"
              style={{ opacity: 0, width: '100%' }}
              delay={1000}
              duration={800}
              type="fadeInUp"
              asView={true}
            >
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
                  console.log('🔘 Opening country modal, countries:', countries.length);
                  setSearchText('');
                  setFilteredCountries(countries);
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
                  <Text style={{ fontSize: 24, marginLeft: 8 }}>
                    {getCountryFlag(selectedCountry.code)}
                  </Text>
                )}
              </TouchableOpacity>
            </AnimatedText>

            {/* Currency Selection */}
            <AnimatedText
              className="w-full mb-6"
              style={{ opacity: 0, width: '100%' }}
              delay={1100}
              duration={800}
              type="fadeInUp"
              asView={true}
            >
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
                  console.log('🔘 Opening currency modal, currencies:', currencies.length);
                  setSearchText('');
                  setFilteredCurrencies(currencies);
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
            </AnimatedText>
          </View>

          {/* Save Button */}
          <AnimatedText
            style={{ opacity: 0, width: '100%' }}
            delay={1200}
            duration={800}
            type="fadeInUp"
            asView={true}
          >
            <View className="w-full">
              <AppleButton
                title={t('onboarding.completeSetup')}
                onPress={handleSave}
                loading={loading}
                disabled={loading || !selectedCountry || !selectedCurrency}
                variant="primary"
                size="large"
                style={{ width: '100%' }}
              />
            </View>
          </AnimatedText>
        </View>
      </ScrollView>

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
              {(() => {
                console.log('📋 Rendering countries list, count:', filteredCountries.length);
                console.log('📋 First country:', filteredCountries[0] ? JSON.stringify(filteredCountries[0]) : 'undefined');
                return filteredCountries.length > 0 ? (
                  <>
                    {filteredCountries.map((country, index) => {
                      console.log(`🏳️ Rendering country ${index}:`, country.name);
                      return renderCountryItem(country);
                    })}
                  </>
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
                );
              })()}
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
              {(() => {
                console.log('📋 Rendering currencies list, count:', filteredCurrencies.length);
                return filteredCurrencies.length > 0 ? (
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
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ProfileSetupScreen;
