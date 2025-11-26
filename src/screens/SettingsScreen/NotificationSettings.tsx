import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';

interface NotificationSettingsProps {
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-gray-50" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.notifications')}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Text className="text-3xl">🔔</Text>
          </View>
          <Text className="text-heading-2 text-text-primary text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.notificationsTitle')}
          </Text>
        </View>

        <View className="bg-white rounded-xl p-6 items-center">
          <Text className="text-body-lg text-text-tertiary text-center mb-4" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.notificationsComingSoon')}
          </Text>
          <Text className="text-body-md text-text-muted text-center" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.notificationsDescription')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettings;
