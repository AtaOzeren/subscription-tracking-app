import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage, availableLanguages, LanguageCode } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';

interface SettingsScreenProps {
  onClose?: () => void;
}

const SettingsScreen = ({ onClose }: SettingsScreenProps) => {
  const insets = useSafeAreaInsets();
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const { t } = useTranslation();
  
  // Modal states
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(currentLanguage.code);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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

  const settingsItems = [
    {
      id: 'language',
      icon: '🌍',
      title: t('settings.language'),
      subtitle: currentLanguage.nativeName,
      onPress: () => {
        setSelectedLanguage(currentLanguage.code);
        setIsLanguageModalVisible(true);
      },
    },
    {
      id: 'security',
      icon: '🔒',
      title: t('settings.security'),
      subtitle: t('settings.securitySubtitle'),
      onPress: () => setShowSecurityModal(true),
    },
    {
      id: 'about',
      icon: 'ⓘ',
      title: t('settings.about'),
      subtitle: t('settings.aboutSubtitle'),
      onPress: () => setShowAboutModal(true),
    },
    {
      id: 'contact',
      icon: '✉',
      title: t('settings.contact'),
      subtitle: t('settings.contactSubtitle'),
      onPress: () => setShowContactModal(true),
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: t('settings.notifications'),
      subtitle: t('settings.notificationsSubtitle'),
      onPress: () => setShowNotificationModal(true),
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          {onClose && <BackButton onPress={onClose} />}
          {!onClose && <View style={{ width: 40 }} />}
          <Text
            className="text-2xl font-bold text-gray-900 flex-1 ml-2"
            style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
          >
            {t('common.settings')}
          </Text>
        </View>
      </View>

      {/* Settings List */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {settingsItems.map((item) => (
          <View key={item.id} className="bg-white rounded-xl mb-2 overflow-hidden">
            <TouchableOpacity
              className="px-4 py-3 flex-row items-center"
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Text className="text-lg text-gray-700">{item.icon}</Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-xs text-gray-500 mt-0.5"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {item.subtitle}
                </Text>
              </View>
              <Text className="text-gray-400 text-lg ml-2">›</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Language Selection Modal - Full Screen */}
      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
            <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
              <BackButton onPress={() => setIsLanguageModalVisible(false)} />
              <Text className="text-xl font-bold flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
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
      </Modal>

      {/* Security Modal - Full Screen */}
      <Modal
        visible={showSecurityModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
            <View className="px-4 pt-2 pb-3 flex-row items-center">
              <BackButton onPress={() => setShowSecurityModal(false)} />
              <Text className="text-xl font-bold flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.security')}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Text className="text-3xl">🔒</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.securityTitle')}
              </Text>
            </View>

            <View className="space-y-4">
              <View className="bg-white rounded-xl p-4 mb-3">
                <View className="flex-row items-start mb-2">
                  <Text className="text-xl mr-3 text-gray-700">●</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1" style={{ fontFamily: 'SF Pro Display' }}>
                      {t('settings.securityPoint1Title')}
                    </Text>
                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'SF Pro Text' }}>
                      {t('settings.securityPoint1Text')}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-xl p-4 mb-3">
                <View className="flex-row items-start mb-2">
                  <Text className="text-xl mr-3 text-gray-700">●</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1" style={{ fontFamily: 'SF Pro Display' }}>
                      {t('settings.securityPoint2Title')}
                    </Text>
                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'SF Pro Text' }}>
                      {t('settings.securityPoint2Text')}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white rounded-xl p-4 mb-3">
                <View className="flex-row items-start mb-2">
                  <Text className="text-xl mr-3 text-gray-700">●</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1" style={{ fontFamily: 'SF Pro Display' }}>
                      {t('settings.securityPoint3Title')}
                    </Text>
                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'SF Pro Text' }}>
                      {t('settings.securityPoint3Text')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* About Modal - Full Screen */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
            <View className="px-4 pt-2 pb-3 flex-row items-center">
              <BackButton onPress={() => setShowAboutModal(false)} />
              <Text className="text-xl font-bold flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.about')}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Text className="text-3xl text-gray-700">ⓘ</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
                Sub-Tracking
              </Text>
              <Text className="text-sm text-gray-500 text-center" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.version')} 1.0.0
              </Text>
            </View>

            <View className="bg-white rounded-xl p-5 mb-4">
              <Text className="text-base text-gray-700 leading-6 mb-4" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.aboutText')}
              </Text>
              <Text className="text-base text-gray-700 leading-6" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.aboutText2')}
              </Text>
            </View>

            <View className="bg-white rounded-xl p-5">
              <Text className="text-base font-semibold text-gray-900 mb-3" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.features')}
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <Text className="text-base mr-2 text-gray-700">•</Text>
                  <Text className="text-sm text-gray-700 flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                    {t('settings.feature1')}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Text className="text-base mr-2 text-gray-700">•</Text>
                  <Text className="text-sm text-gray-700 flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                    {t('settings.feature2')}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Text className="text-base mr-2 text-gray-700">•</Text>
                  <Text className="text-sm text-gray-700 flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                    {t('settings.feature3')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-base mr-2 text-gray-700">•</Text>
                  <Text className="text-sm text-gray-700 flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                    {t('settings.feature4')}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Contact Modal - Full Screen */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
            <View className="px-4 pt-2 pb-3 flex-row items-center">
              <BackButton onPress={() => setShowContactModal(false)} />
              <Text className="text-xl font-bold flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.contact')}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Text className="text-3xl text-gray-700">✉</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.contactTitle')}
              </Text>
            </View>

            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-base text-gray-600 text-center mb-4" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.contactComingSoon')}
              </Text>
              <Text className="text-sm text-gray-500 text-center" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.contactDescription')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Notifications Modal - Full Screen */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
            <View className="px-4 pt-2 pb-3 flex-row items-center">
              <BackButton onPress={() => setShowNotificationModal(false)} />
              <Text className="text-xl font-bold flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.notifications')}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Text className="text-3xl">🔔</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
                {t('settings.notificationsTitle')}
              </Text>
            </View>

            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-base text-gray-600 text-center mb-4" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.notificationsComingSoon')}
              </Text>
              <Text className="text-sm text-gray-500 text-center" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.notificationsDescription')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsScreen;
