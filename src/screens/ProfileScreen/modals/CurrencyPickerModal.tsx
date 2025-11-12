import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Currency } from '../../../types/reference';

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currencies: Currency[];
  selectedCurrency: string;
  onSelectCurrency: (currencyCode: string) => void;
}

const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  onClose,
  currencies,
  selectedCurrency,
  onSelectCurrency,
}) => {
  const { t } = useTranslation();

  // Sıralama: Seçili en üstte, sonra USD, EUR, sonra diğerleri alfabetik
  const sortedCurrencies = React.useMemo(() => {
    const selected = currencies.find(c => c.code === selectedCurrency);
    const usd = currencies.find(c => c.code === 'USD' && c.code !== selectedCurrency);
    const eur = currencies.find(c => c.code === 'EUR' && c.code !== selectedCurrency);
    const others = currencies
      .filter(c => 
        c.code !== selectedCurrency && 
        c.code !== 'USD' && 
        c.code !== 'EUR'
      )
      .sort((a, b) => a.name.localeCompare(b.name));
    
    const result = [];
    if (selected) result.push(selected);
    if (usd) result.push(usd);
    if (eur) result.push(eur);
    result.push(...others);
    
    return result;
  }, [currencies, selectedCurrency]);

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
                {t('profile.selectCurrency', { defaultValue: 'Select Currency' })}
              </Text>
              <View style={{ width: 60 }} />
            </View>
          </View>

          {/* Currency List */}
          <ScrollView className="p-4">
            {sortedCurrencies.map((currency, index) => (
              <TouchableOpacity
                key={currency.code}
                onPress={() => {
                  onSelectCurrency(currency.code);
                  onClose();
                }}
                className={`p-4 rounded-xl ${index < sortedCurrencies.length - 1 ? 'mb-2' : ''}`}
                style={{
                  backgroundColor: selectedCurrency === currency.code ? '#EBF5FF' : '#F9FAFB',
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text
                      className="text-body-lg text-text-primary font-semibold"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {currency.name}
                    </Text>
                    <Text
                      className="text-body-md text-text-muted"
                      style={{ fontFamily: 'SF Pro Text' }}
                    >
                      {currency.code} ({currency.symbol})
                    </Text>
                  </View>
                  {selectedCurrency === currency.code && (
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

export default CurrencyPickerModal;
