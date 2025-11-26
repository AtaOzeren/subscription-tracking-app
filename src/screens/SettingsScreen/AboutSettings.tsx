import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';
import PremiumSupportButton from '../../components/common/PremiumSupportButton';

interface AboutSettingsProps {
  onClose: () => void;
}

const AboutSettings: React.FC<AboutSettingsProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.about')}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Text className="text-heading-1 text-text-secondary">ⓘ</Text>
          </View>
          <Text className="text-heading-2 text-text-primary text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
            SubStater
          </Text>
          <Text className="text-body-md text-text-muted text-center" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.version')} 1.0.0
          </Text>
        </View>

        <View className="bg-white rounded-xl p-5 mb-4">
          <Text className="text-body-lg text-text-secondary leading-6 mb-4" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.aboutText')}
          </Text>
          <Text className="text-body-lg text-text-secondary leading-6" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.aboutText2')}
          </Text>
        </View>

        <View className="bg-white rounded-xl p-5">
          <Text className="text-body-lg text-text-primary font-semibold mb-3" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.features')}
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-center mb-2">
              <Text className="text-body-lg mr-2 text-text-secondary">•</Text>
              <Text className="text-body-md text-text-secondary flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.feature1')}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-body-lg mr-2 text-text-secondary">•</Text>
              <Text className="text-body-md text-text-secondary flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.feature2')}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Text className="text-body-lg mr-2 text-text-secondary">•</Text>
              <Text className="text-body-md text-text-secondary flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.feature3')}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-body-lg mr-2 text-text-secondary">•</Text>
              <Text className="text-body-md text-text-secondary flex-1" style={{ fontFamily: 'SF Pro Text' }}>
                {t('settings.feature4')}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <PremiumSupportButton />
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutSettings;
