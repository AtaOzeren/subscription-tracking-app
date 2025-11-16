import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../../services/profileService';
import { referenceService } from '../../../services/referenceService';
import { Country, Currency } from '../../../types/reference';
import AppleButton from '../../../components/common/AppleButton';
import MinimalLoader from '../../../components/common/MinimalLoader';
import CountryPickerModal from './CountryPickerModal';
import CurrencyPickerModal from './CurrencyPickerModal';

interface RegionalSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  currentName?: string;
  currentRegion?: string;
  currentCurrency?: string;
  onUpdateSuccess: () => void;
}

const RegionalSettingsModal: React.FC<RegionalSettingsModalProps> = ({
  visible,
  onClose,
  currentName,
  currentRegion,
  currentCurrency,
  onUpdateSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [countries, setCountries] = useState<Country[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(currentRegion || '');
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency || '');
  const [loadingReference, setLoadingReference] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedCountry(currentRegion || '');
      setSelectedCurrency(currentCurrency || '');
      fetchReferenceData();
    }
  }, [visible, currentRegion, currentCurrency]);

  const fetchReferenceData = async () => {
    setLoadingReference(true);
    try {
      const [countriesData, currenciesData] = await Promise.all([
        referenceService.getCountries(),
        referenceService.getCurrencies(),
      ]);
      setCountries(countriesData.filter(c => c.deleted_at === null));
      setCurrencies(currenciesData.filter(c => c.deleted_at === null));
    } catch (error) {
      console.error('[RegionalSettings] Error fetching reference data:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : 'Failed to fetch reference data'
      );
    } finally {
      setLoadingReference(false);
    }
  };

  const handleUpdate = async () => {
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
              setUpdating(true);

              await profileService.updateProfile({
                name: currentName,
                region: selectedCountry,
                currency: selectedCurrency,
              });

              onClose();
              onUpdateSuccess();

              Alert.alert(
                t('common.success'),
                t('profile.regionalUpdateSuccess', { defaultValue: 'Regional settings updated successfully' })
              );
            } catch (error) {
              console.error('[RegionalSettings] Error updating regional settings:', error);
              Alert.alert(
                t('common.error'),
                error instanceof Error ? error.message : 'Failed to update regional settings'
              );
            } finally {
              setUpdating(false);
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View
          className="bg-white border-b border-gray-200"
          style={{ paddingTop: insets.top }}
        >
          <View className="px-4 pt-4 pb-3 flex-row items-center">
            {/* Back button on left */}
            <TouchableOpacity onPress={onClose} className="w-10">
              <Text className="text-2xl text-text-secondary font-display">←</Text>
            </TouchableOpacity>
            
            {/* Title - Centered */}
            <View className="flex-1 items-center">
              <Text className="text-heading-2 text-text-primary font-display">
                {t('profile.regionalSettings', { defaultValue: 'Regional Settings' })}
              </Text>
            </View>
            
            {/* Empty space on right for balance */}
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
          {loadingReference ? (
            <View className="items-center justify-center p-8">
              <MinimalLoader size="medium" color="#000000" />
              <Text className="text-body-lg text-text-tertiary mt-4 font-text">
                {t('common.loading', { defaultValue: 'Loading' })}
              </Text>
            </View>
          ) : (
            <>
              {/* Country Selector */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text
                  className="text-body-md text-text-secondary font-semibold mb-2"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {t('profile.region', { defaultValue: 'Region' })}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(true)}
                  className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <Text
                    className="text-body-lg text-text-primary"
                    style={{ fontFamily: 'SF Pro Text' }}
                  >
                    {selectedCountry ? getCountryName(selectedCountry) : t('profile.selectRegion', { defaultValue: 'Select Region' })}
                  </Text>
                  <Text className="text-text-subtle">›</Text>
                </TouchableOpacity>
              </View>

              {/* Currency Selector */}
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text
                  className="text-body-md text-text-secondary font-semibold mb-2"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {t('profile.currency', { defaultValue: 'Currency' })}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCurrencyPicker(true)}
                  className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between"
                >
                  <Text
                    className="text-body-lg text-text-primary"
                    style={{ fontFamily: 'SF Pro Text' }}
                  >
                    {selectedCurrency ? getCurrencyName(selectedCurrency) : t('profile.selectCurrency', { defaultValue: 'Select Currency' })}
                  </Text>
                  <Text className="text-text-subtle">›</Text>
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <AppleButton
                title={t('common.save', { defaultValue: 'Save' })}
                onPress={handleUpdate}
                disabled={updating}
                loading={updating}
                size="large"
                containerClassName="mb-6"
              />
            </>
          )}
        </ScrollView>

        {/* Country Picker Modal */}
        <CountryPickerModal
          visible={showCountryPicker}
          onClose={() => setShowCountryPicker(false)}
          countries={countries}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
        />

        {/* Currency Picker Modal */}
        <CurrencyPickerModal
          visible={showCurrencyPicker}
          onClose={() => setShowCurrencyPicker(false)}
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
        />
      </View>
    </Modal>
  );
};

export default RegionalSettingsModal;
