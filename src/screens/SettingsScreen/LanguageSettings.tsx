import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage, availableLanguages, LanguageCode } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';

interface LanguageSettingsProps {
  onClose: () => void;
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation();
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
      onClose();
    } catch (error) {
      console.error('[LanguageSettings] Error changing language:', error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-gray-50" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.language')}
          </Text>
          <TouchableOpacity onPress={handleSaveLanguage} disabled={isLoading}>
            <Text className="text-black text-base font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {availableLanguages.map((language) => (
          <TouchableOpacity
            key={language.code}
            onPress={() => handleLanguageSelect(language.code)}
            disabled={isLoading}
            className="w-full p-3 rounded-xl border-2 mb-3 bg-white"
            style={{
              borderColor: selectedLanguage === language.code ? languageColors[language.code].border : '#E5E5EA',
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
  );
};

export default LanguageSettings;
