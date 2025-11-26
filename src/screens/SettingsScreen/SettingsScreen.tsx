import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';
import LanguageSettings from './LanguageSettings';
import SecuritySettings from './SecuritySettings';
import AboutSettings from './AboutSettings';
import ContactSettings from './ContactSettings';
import NotificationSettings from './NotificationSettings';

interface SettingsScreenProps {
  onClose?: () => void;
}

const SettingsScreen = ({ onClose }: SettingsScreenProps) => {
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();

  // Modal states
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const settingsItems = [
    {
      id: 'language',
      icon: '🌍',
      title: t('settings.language'),
      subtitle: currentLanguage.nativeName,
      onPress: () => setIsLanguageModalVisible(true),
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
        className="bg-gray-50"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          {onClose && <BackButton onPress={onClose} />}
          {!onClose && <View style={{ width: 40 }} />}
          <Text
            className="text-heading-2 text-text-primary flex-1 ml-2"
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
                  className="text-body-lg text-text-primary font-semibold"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-body-sm text-text-muted mt-0.5"
                  style={{ fontFamily: 'SF Pro Text' }}
                >
                  {item.subtitle}
                </Text>
              </View>
              <Text className="text-text-subtle text-lg ml-2">›</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Modals */}
      <Modal
        visible={isLanguageModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <LanguageSettings onClose={() => setIsLanguageModalVisible(false)} />
      </Modal>

      <Modal
        visible={showSecurityModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SecuritySettings onClose={() => setShowSecurityModal(false)} />
      </Modal>

      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <AboutSettings onClose={() => setShowAboutModal(false)} />
      </Modal>

      <Modal
        visible={showContactModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <ContactSettings onClose={() => setShowContactModal(false)} />
      </Modal>

      <Modal
        visible={showNotificationModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <NotificationSettings onClose={() => setShowNotificationModal(false)} />
      </Modal>
    </View>
  );
};

export default SettingsScreen;
