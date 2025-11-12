import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Country } from '../../../types/reference';
import CountryFlag from '../../../components/common/CountryFlag';

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  countries: Country[];
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
}

const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  visible,
  onClose,
  countries,
  selectedCountry,
  onSelectCountry,
}) => {
  const { t } = useTranslation();

  // Sıralama: Seçili ülke en üstte, sonra diğerleri alfabetik
  const sortedCountries = React.useMemo(() => {
    const selected = countries.find(c => c.code === selectedCountry);
    const others = countries
      .filter(c => c.code !== selectedCountry)
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return selected ? [selected, ...others] : others;
  }, [countries, selectedCountry]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
          {/* Modal Header */}
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={onClose}>
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
            {sortedCountries.map((country, index) => (
              <TouchableOpacity
                key={country.code}
                onPress={() => {
                  onSelectCountry(country.code);
                  onClose();
                }}
                className={`p-4 rounded-xl ${index < sortedCountries.length - 1 ? 'mb-2' : ''}`}
                style={{
                  backgroundColor: selectedCountry === country.code ? '#EBF5FF' : '#F9FAFB',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <CountryFlag countryCode={country.code} size={24} />
                    <Text
                      className="text-body-lg text-text-primary font-semibold ml-3"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {country.name}
                    </Text>
                  </View>
                  {selectedCountry === country.code && (
                    <Text className="text-accent text-xl">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CountryPickerModal;
