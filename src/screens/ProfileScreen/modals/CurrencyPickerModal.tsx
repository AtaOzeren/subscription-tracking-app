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
            {currencies.map((currency, index) => (
              <TouchableOpacity
                key={currency.code}
                onPress={() => {
                  onSelectCurrency(currency.code);
                  onClose();
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
  );
};

export default CurrencyPickerModal;
