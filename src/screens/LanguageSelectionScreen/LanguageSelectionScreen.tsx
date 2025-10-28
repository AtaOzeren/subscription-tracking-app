import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useLanguage, availableLanguages } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AppleButton from '../../components/common/AppleButton';
import AnimatedText from '../../components/common/AnimatedText';

const LanguageSelectionScreen: React.FC = () => {
  const { changeLanguage, isLoading } = useLanguage();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleLanguageSelect = async (languageCode: 'en' | 'de' | 'tr' | 'it' | 'fr' | 'ru') => {
    try {
      await changeLanguage(languageCode);
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
          <View className="w-full space-y-3">
            {availableLanguages.map((language, index) => (
              <AnimatedText
                key={language.code}
                style={{ opacity: 0, width: '100%' }}
                delay={1000 + (index * 100)}
                duration={800}
                type="fadeInUp"
              >
                <View style={{ width: '100%' }}>
                  <TouchableOpacity
                    onPress={() => handleLanguageSelect(language.code)}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-xl border-2 ${
                      isLoading 
                        ? 'bg-gray-100 border-gray-200' 
                        : 'bg-white border-gray-200 active:border-ios-blue active:bg-ios-blue/5'
                    }`}
                    style={{ 
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-ios-blue/10 items-center justify-center mr-3">
                          <Text className="text-ios-blue font-bold text-sm">
                            {language.code.toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-gray-800 font-semibold text-base" style={{ fontFamily: 'SF Pro Display' }}>
                            {language.nativeName}
                          </Text>
                          <Text className="text-gray-500 text-sm" style={{ fontFamily: 'SF Pro Text' }}>
                            {language.name}
                          </Text>
                        </View>
                      </View>
                      <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    </View>
                  </TouchableOpacity>
                </View>
              </AnimatedText>
            ))}
          </View>

          {/* Continue Button */}
          <AnimatedText
            style={{ opacity: 0, width: '100%' }}
            delay={1600}
            duration={800}
            type="fadeInUp"
          >
            <View style={{ width: '100%', marginTop: 30 }}>
              <AppleButton
                title="Continue with English"
                onPress={() => handleLanguageSelect('en')}
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