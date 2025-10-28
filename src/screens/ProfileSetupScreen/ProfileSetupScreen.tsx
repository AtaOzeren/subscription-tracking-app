import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { referenceService } from '../../services/referenceService';
import { storageService } from '../../services/storageService';
import { Country, Currency } from '../../types/reference';
import Logo from '../../components/common/Logo';
import AnimatedText from '../../components/common/AnimatedText';
import AppleButton from '../../components/common/AppleButton';

const ProfileSetupScreen = () => {
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
    if (searchText === '') {
      setFilteredCountries(countries);
    } else {
      setFilteredCountries(
        countries.filter(country => 
          country.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    console.log('🔍 Filtered countries:', searchText === '' ? countries.length : filteredCountries.length);
  }, [searchText, countries]);

  useEffect(() => {
    if (searchText === '') {
      setFilteredCurrencies(currencies);
    } else {
      setFilteredCurrencies(
        currencies.filter(currency => 
          currency.name.toLowerCase().includes(searchText.toLowerCase()) ||
          currency.code.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    console.log('🔍 Filtered currencies:', searchText === '' ? currencies.length : filteredCurrencies.length);
  }, [searchText, currencies]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 ProfileSetup: Loading countries and currencies...');
      
      const [countriesData, currenciesData] = await Promise.all([
        referenceService.getCountries(),
        referenceService.getCurrencies()
      ]);
      
      console.log('✅ ProfileSetup: Countries loaded:', countriesData.length);
      console.log('📦 Countries data:', JSON.stringify(countriesData, null, 2));
      console.log('✅ ProfileSetup: Currencies loaded:', currenciesData.length);
      console.log('📦 Currencies data:', JSON.stringify(currenciesData, null, 2));
      
      setCountries(countriesData);
      setCurrencies(currenciesData);
      setFilteredCountries(countriesData);
      setFilteredCurrencies(currenciesData);
      
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
    return (
      <TouchableOpacity
        key={item.code}
        onPress={() => {
          console.log('👆 Country selected:', item.name);
          setSelectedCountry(item);
          setShowCountryModal(false);
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
          {item.region}
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
                }}
              >
                <Text 
                  className="text-base"
                  style={{ 
                    fontFamily: 'SF Pro Text',
                    fontSize: 16,
                    color: selectedCountry ? '#1C1C1E' : '#8E8E93'
                  }}
                >
                  {selectedCountry ? selectedCountry.name : t('onboarding.countryPlaceholder')}
                </Text>
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
