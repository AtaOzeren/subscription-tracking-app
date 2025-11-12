import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';

interface SecuritySettingsProps {
  onClose: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.security')}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Text className="text-3xl">🔒</Text>
          </View>
          <Text className="text-heading-2 text-text-primary text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.securityTitle')}
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row items-start mb-2">
              <Text className="text-heading-3 mr-3 text-text-secondary">●</Text>
              <View className="flex-1">
                <Text className="text-body-lg text-text-primary font-semibold mb-1" style={{ fontFamily: 'SF Pro Display' }}>
                  {t('settings.securityPoint1Title')}
                </Text>
                <Text className="text-body-md text-text-tertiary" style={{ fontFamily: 'SF Pro Text' }}>
                  {t('settings.securityPoint1Text')}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row items-start mb-2">
              <Text className="text-heading-3 mr-3 text-text-secondary">●</Text>
              <View className="flex-1">
                <Text className="text-body-lg text-text-primary font-semibold mb-1" style={{ fontFamily: 'SF Pro Display' }}>
                  {t('settings.securityPoint2Title')}
                </Text>
                <Text className="text-body-md text-text-tertiary" style={{ fontFamily: 'SF Pro Text' }}>
                  {t('settings.securityPoint2Text')}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 mb-3">
            <View className="flex-row items-start mb-2">
              <Text className="text-heading-3 mr-3 text-text-secondary">●</Text>
              <View className="flex-1">
                <Text className="text-body-lg text-text-primary font-semibold mb-1" style={{ fontFamily: 'SF Pro Display' }}>
                  {t('settings.securityPoint3Title')}
                </Text>
                <Text className="text-body-md text-text-tertiary" style={{ fontFamily: 'SF Pro Text' }}>
                  {t('settings.securityPoint3Text')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SecuritySettings;
