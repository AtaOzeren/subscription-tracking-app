import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';

interface ContactSettingsProps {
  onClose: () => void;
}

const ContactSettings: React.FC<ContactSettingsProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.contact')}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Text className="text-heading-1 text-text-secondary">✉</Text>
          </View>
          <Text className="text-heading-2 text-text-primary text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.contactTitle')}
          </Text>
        </View>

        <View className="bg-white rounded-xl p-6 items-center">
          <Text className="text-body-lg text-text-tertiary text-center mb-4" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.contactComingSoon')}
          </Text>
          <Text className="text-body-md text-text-muted text-center" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.contactDescription')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactSettings;
