import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage, availableLanguages, LanguageCode } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const SettingsScreen = () => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(currentLanguage.code);

  const languageColors = {
    en: { border: '#000000', text: '#FFFFFF' },
    de: { border: '#000000', text: '#FFCE00' },
    tr: { border: '#000000', text: '#FFFFFF' },
    it: { border: '#000000', text: '#FFFFFF' },
    fr: { border: '#000000', text: '#FFFFFF' },
    ru: { border: '#000000', text: '#FFFFFF' },
  };

  const renderFlagBadge = (code: LanguageCode) => {
    switch (code) {
      case 'en':
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden">
            <View className="flex-1" style={{ backgroundColor: '#C8102E' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#012169' }} />
          </View>
        );
      case 'de':
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden">
            <View className="flex-1" style={{ backgroundColor: '#000000' }} />
            <View className="flex-1" style={{ backgroundColor: '#DD0000' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFCE00' }} />
          </View>
        );
      case 'tr':
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden items-center justify-center" style={{ backgroundColor: '#E30A17' }}>
            <Text className="font-bold text-[10px]" style={{ color: '#FFFFFF', fontFamily: 'SF Pro Display' }}>
              TR
            </Text>
          </View>
        );
      case 'it':
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden flex-row">
            <View className="flex-1" style={{ backgroundColor: '#009246' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#CE2B37' }} />
          </View>
        );
      case 'fr':
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden flex-row">
            <View className="flex-1" style={{ backgroundColor: '#0055A4' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#EF4135' }} />
          </View>
        );
      case 'ru':
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden">
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#0039A6' }} />
            <View className="flex-1" style={{ backgroundColor: '#D52B1E' }} />
          </View>
        );
      default:
        return null;
    }
  };

  const handleLanguageSelect = (languageCode: LanguageCode) => {
    setSelectedLanguage(languageCode);
  };

  const handleSaveLanguage = async () => {
    try {
      await changeLanguage(selectedLanguage);
      setIsLanguageModalVisible(false);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          {t('common.settings') || 'Settings'}
        </Text>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Language Setting */}
          <View className="bg-white rounded-lg shadow-sm mb-4">
            <TouchableOpacity 
              className="p-4 flex-row items-center justify-between"
              onPress={() => {
                setSelectedLanguage(currentLanguage.code);
                setIsLanguageModalVisible(true);
              }}
            >
              <View className="flex-row items-center">
                {renderFlagBadge(currentLanguage.code)}
                <View className="ml-3">
                  <Text className="text-gray-800 font-semibold text-base" style={{ fontFamily: 'SF Pro Display' }}>
                    {t('language.selectLanguage') || 'Language'}
                  </Text>
                  <Text className="text-gray-500 text-sm" style={{ fontFamily: 'SF Pro Text' }}>
                    {currentLanguage.nativeName}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
            {/* Modal Header */}
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setIsLanguageModalVisible(false)}>
                  <Text className="text-gray-600 text-base" style={{ fontFamily: 'SF Pro Text' }}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold" style={{ fontFamily: 'SF Pro Display' }}>
                  {t('language.selectLanguage')}
                </Text>
                <TouchableOpacity onPress={handleSaveLanguage} disabled={isLoading}>
                  <Text className="text-black text-base font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
                    {t('common.save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Language Options */}
            <ScrollView className="p-4">
              {availableLanguages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => handleLanguageSelect(language.code)}
                  disabled={isLoading}
                  className={`w-full p-3 rounded-xl border-2 ${index < availableLanguages.length - 1 ? 'mb-4' : ''}`}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                    borderColor: selectedLanguage === language.code ? languageColors[language.code].border : '#E5E5EA',
                    borderWidth: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      {renderFlagBadge(language.code)}
                      <View className="ml-3">
                        <Text 
                          className="font-semibold text-base" 
                          style={{ 
                            fontFamily: 'SF Pro Display',
                            color: selectedLanguage === language.code ? languageColors[language.code].border : '#1C1C1E'
                          }}
                        >
                          {language.nativeName}
                        </Text>
                        <Text 
                          className="text-sm" 
                          style={{ 
                            fontFamily: 'SF Pro Text',
                            color: selectedLanguage === language.code ? languageColors[language.code].border + 'B3' : '#8E8E93'
                          }}
                        >
                          {language.name}
                        </Text>
                      </View>
                    </View>
                    <View 
                      className="w-6 h-6 rounded-full border-2 items-center justify-center"
                      style={{
                        borderColor: selectedLanguage === language.code ? languageColors[language.code].border : '#C7C7CC',
                        backgroundColor: selectedLanguage === language.code ? languageColors[language.code].border : 'transparent',
                      }}
                    >
                      {selectedLanguage === language.code && (
                        <View className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SettingsScreen;