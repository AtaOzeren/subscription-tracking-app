import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, availableLanguages, LanguageCode } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { getGreetingMessage } from '../../utils/helpers';
import ProfileButton from '../../components/common/ProfileButton';

interface HomeScreenProps {
  scrollY?: Animated.Value;
  tabBarHeight?: number;
}

const HomeScreen = ({ scrollY, tabBarHeight = 100 }: HomeScreenProps) => {
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(currentLanguage.code);
  const [greetingMessage, setGreetingMessage] = useState('');

  useEffect(() => {
    // Force layout recalculation on mount to fix initial positioning issue
    const timer = setTimeout(() => {
      // This forces a re-render which recalculates the layout
      // Similar to what happens when language is changed
      setIsLanguageModalVisible(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update greeting message when user changes or every minute
    const updateGreeting = () => {
      if (user?.name) {
        setGreetingMessage(getGreetingMessage(user.name));
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user?.name]);

  const handleProfilePress = () => {
    // Navigate to profile screen
    // TODO: Implement navigation when navigation prop is available
    console.log('Profile button pressed - navigation to be implemented');
  };

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
          <View className="w-6 h-6 rounded-full overflow-hidden">
            <View className="flex-1" style={{ backgroundColor: '#C8102E' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#012169' }} />
          </View>
        );
      case 'de':
        return (
          <View className="w-6 h-6 rounded-full overflow-hidden">
            <View className="flex-1" style={{ backgroundColor: '#000000' }} />
            <View className="flex-1" style={{ backgroundColor: '#DD0000' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFCE00' }} />
          </View>
        );
      case 'tr':
        return (
          <View className="w-6 h-6 rounded-full overflow-hidden items-center justify-center" style={{ backgroundColor: '#E30A17' }}>
            <Text className="font-bold text-[8px]" style={{ color: '#FFFFFF', fontFamily: 'SF Pro Display' }}>
              TR
            </Text>
          </View>
        );
      case 'it':
        return (
          <View className="w-6 h-6 rounded-full overflow-hidden flex-row">
            <View className="flex-1" style={{ backgroundColor: '#009246' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#CE2B37' }} />
          </View>
        );
      case 'fr':
        return (
          <View className="w-6 h-6 rounded-full overflow-hidden flex-row">
            <View className="flex-1" style={{ backgroundColor: '#0055A4' }} />
            <View className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
            <View className="flex-1" style={{ backgroundColor: '#EF4135' }} />
          </View>
        );
      case 'ru':
        return (
          <View className="w-6 h-6 rounded-full overflow-hidden">
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

  const handleLogout = () => {
    Alert.alert(
      t('common.logout'),
      'Are you sure you want to logout?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingBottom: 0 }}>
      <View className="p-4" style={{ paddingBottom: tabBarHeight + insets.bottom + 25 }}>
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-2xl font-bold text-gray-800">
              {greetingMessage || t('home.mySubscriptions')}
            </Text>
            <Text className="text-sm text-gray-500">
              {t('home.trackExpenses')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <ProfileButton onPress={handleProfilePress} />
          </View>
        </View>

        
        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-blue-500 rounded-lg p-4 flex-1 mr-2">
            <Text className="text-white text-sm">{t('home.monthly')}</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
          <View className="bg-green-500 rounded-lg p-4 flex-1 ml-2">
            <Text className="text-white text-sm">{t('home.yearly')}</Text>
            <Text className="text-white text-xl font-bold">$0.00</Text>
          </View>
        </View>

        {/* Subscriptions List */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-800">
            {t('home.activeSubscriptions', { count: 0 })}
          </Text>
        </View>
        
        <ScrollView 
          className="flex-1"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY || new Animated.Value(0) } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-gray-500 text-center py-8">
              {t('home.noSubscriptions')}
            </Text>
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
                      <View className="mr-3">
                        {renderFlagBadge(language.code)}
                      </View>
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
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;