import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage, availableLanguages } from '../../contexts/LanguageContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppleButton from '../../components/common/AppleButton';
import AnimatedText from '../../components/common/AnimatedText';
import ProgressIndicator from '../../components/common/ProgressIndicator';
import BackButton from '../../components/common/BackButton';

const LanguageSelectionScreen: React.FC = () => {
  const { changeLanguage, isLoading, currentLanguage } = useLanguage();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = React.useState<'en' | 'de' | 'tr' | 'it' | 'fr' | 'ru'>(currentLanguage.code);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  // Track if screen has been visited before to disable animations
  useFocusEffect(
    React.useCallback(() => {
      // Mark as animated after first visit
      if (!hasAnimated) {
        setHasAnimated(true);
      }
    }, [hasAnimated])
  );

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
      // console.log('🌍 Changing language to:', selectedLanguage);
      await changeLanguage(selectedLanguage);
      // console.log('✅ Language changed successfully');
      // Navigate to Auth navigator after language selection
      navigation.navigate('Auth' as never);
    } catch (error) {
      console.error('[LanguageSelection] Error selecting language:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Back Button */}
      <View className="px-6 pt-2 pb-4">
        <BackButton />
      </View>

      {/* Header Section - Fixed */}
      <View className="items-center px-6 mb-8">
        <AnimatedText
          style={{
            fontFamily: 'SF Pro Display',
            fontSize: 32,
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
          delay={hasAnimated ? 0 : 600}
          duration={hasAnimated ? 0 : 1000}
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
          delay={hasAnimated ? 0 : 800}
          duration={hasAnimated ? 0 : 1000}
          type="fadeInUp"
        >
          Choose your preferred language
        </AnimatedText>
      </View>

      {/* Language Options - Scrollable Container */}
      <View className="flex-1 px-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {availableLanguages.map((language, index) => (
            <AnimatedText
              key={language.code}
              className="w-full mb-4"
              style={{ opacity: 0, width: '100%' }}
              delay={hasAnimated ? 0 : 1000 + (index * 100)}
              duration={hasAnimated ? 0 : 800}
              type="fadeInUp"
              asView={true}
            >
              <TouchableOpacity
                onPress={() => handleLanguageSelect(language.code)}
                disabled={isLoading}
                className="w-full p-4 rounded-2xl border-2 bg-white"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                  borderColor: selectedLanguage === language.code ? '#000000' : '#E5E5EA',
                  borderWidth: 2,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {renderFlagBadge(language.code)}
                    <View className="flex-1">
                      <Text
                        className="font-semibold text-base"
                        style={{
                          fontFamily: 'SF Pro Display',
                          color: selectedLanguage === language.code ? '#000000' : '#1C1C1E',
                          fontSize: 17,
                        }}
                      >
                        {language.nativeName}
                      </Text>
                      <Text
                        className="text-sm mt-0.5"
                        style={{
                          fontFamily: 'SF Pro Text',
                          color: '#8E8E93',
                          fontSize: 14,
                        }}
                      >
                        {language.name}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="w-6 h-6 rounded-full border-2 items-center justify-center"
                    style={{
                      borderColor: selectedLanguage === language.code ? '#000000' : '#C7C7CC',
                      backgroundColor: selectedLanguage === language.code ? '#000000' : 'transparent',
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
        </ScrollView>
      </View>

      {/* Progress Indicator */}
      <AnimatedText
        style={{ opacity: 0 }}
        delay={hasAnimated ? 0 : 1500}
        duration={hasAnimated ? 0 : 800}
        type="fadeInUp"
        asView={true}
      >
        <View className="items-center mb-4">
          <ProgressIndicator totalSteps={3} currentStep={2} />
        </View>
      </AnimatedText>

      {/* Continue Button - Fixed at Bottom */}
      <AnimatedText
        style={{ opacity: 0 }}
        delay={hasAnimated ? 0 : 1600}
        duration={hasAnimated ? 0 : 800}
        type="fadeInUp"
        asView={true}
      >
        <View className="px-6 pb-6">
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
    </SafeAreaView>
  );
};

export default LanguageSelectionScreen;