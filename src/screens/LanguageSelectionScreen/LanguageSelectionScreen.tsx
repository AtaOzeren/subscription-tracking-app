import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useLanguage, availableLanguages } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppleButton from '../../components/common/AppleButton';
import AnimatedText from '../../components/common/AnimatedText';

const LanguageSelectionScreen: React.FC = () => {
  const { changeLanguage, isLoading, currentLanguage } = useLanguage();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = React.useState<'en' | 'de' | 'tr' | 'it' | 'fr' | 'ru'>(currentLanguage.code);

  // Flag colors for each language - Using black for all
  const languageColors = {
    en: { border: '#000000', text: '#FFFFFF' },      // Black
    de: { border: '#000000', text: '#FFCE00' },      // Black
    tr: { border: '#000000', text: '#FFFFFF' },      // Black
    it: { border: '#000000', text: '#FFFFFF' },      // Black
    fr: { border: '#000000', text: '#FFFFFF' },      // Black
    ru: { border: '#000000', text: '#FFFFFF' },      // Black
  };

  // Render flag badge with country colors
  const renderFlagBadge = (code: 'en' | 'de' | 'tr' | 'it' | 'fr' | 'ru') => {
    switch (code) {
      case 'en': // UK Flag - Simple Red, White, Blue design
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <View className="flex-1" style={{ backgroundColor: '#C8102E' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#012169' }} />
          </View>
        );
      case 'de': // Germany Flag (Black, Red, Gold)
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <View className="flex-1" style={{ backgroundColor: '#000000' }} />
            <View className="flex-1" style={{ backgroundColor: '#DD0000' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFCE00' }} />
          </View>
        );
      case 'tr': // Turkey Flag (Red with white crescent)
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden items-center justify-center mr-3" style={{ backgroundColor: '#E30A17' }}>
            <Text className="font-bold text-[10px]" style={{ color: '#FFFFFF', fontFamily: 'SF Pro Display' }}>
              {code.toUpperCase()}
            </Text>
          </View>
        );
      case 'it': // Italy Flag (Green, White, Red)
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden flex-row mr-3">
            <View className="flex-1" style={{ backgroundColor: '#009246' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#CE2B37' }} />
          </View>
        );
      case 'fr': // France Flag (Blue, White, Red)
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden flex-row mr-3">
            <View className="flex-1" style={{ backgroundColor: '#0055A4' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#EF4135' }} />
          </View>
        );
      case 'ru': // Russia Flag (White, Blue, Red)
        return (
          <View className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#0039A6' }} />
            <View className="flex-1" style={{ backgroundColor: '#D52B1E' }} />
          </View>
        );
      default:
        return null;
    }
  };

  const handleLanguageSelect = (languageCode: 'en' | 'de' | 'tr' | 'it' | 'fr' | 'ru') => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = async () => {
    try {
      await changeLanguage(selectedLanguage);
      // Navigate to Login screen after language selection
      navigation.navigate('Login' as never);
    } catch (error) {
      console.error('Error selecting language:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ios-background">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header Section */}
          <View className="items-center mb-12">
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
                {t('language.selectLanguage')}
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
                Choose your preferred language
              </AnimatedText>
            </View>
          </View>

          {/* Language Options */}
          <View className="w-full">
            {availableLanguages.map((language, index) => (
              <AnimatedText
                key={language.code}
                className={`w-full ${index < availableLanguages.length - 1 ? 'mb-6' : ''}`}
                style={{ opacity: 0, width: '100%' }}
                delay={1000 + (index * 100)}
                duration={800}
                type="fadeInUp"
                asView={true}
              >
                <TouchableOpacity
                  onPress={() => handleLanguageSelect(language.code)}
                  disabled={isLoading}
                  className={`w-full p-3 rounded-xl border-2 ${
                    isLoading 
                      ? 'bg-gray-100 border-gray-200' 
                      : 'bg-white border-gray-200'
                  }`}
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
                      <View>
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
              </AnimatedText>
            ))}
          </View>

          {/* Continue Button */}
          <AnimatedText
            style={{ opacity: 0, width: '100%' }}
            delay={1600}
            duration={800}
            type="fadeInUp"
            asView={true}
          >
            <View className="w-full mt-8">
              <AppleButton
                title={t('common.next')}
                onPress={handleContinue}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                size="large"
                style={{ width: '100%' }}
              />
            </View>
          </AnimatedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSelectionScreen;