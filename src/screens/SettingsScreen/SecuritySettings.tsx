import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

interface SecuritySettingsProps {
  onClose: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleDeleteLocalData = () => {
    Alert.alert(
      t('settings.deleteLocalDataTitle'),
      t('settings.deleteLocalDataMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.forceLogout();
              logout();
            } catch (error) {
              console.error('Error deleting local data:', error);
              Alert.alert(t('common.error'), t('common.somethingWentWrong'));
            }
          },
        },
      ]
    );
  };

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

        <View className="space-y-4 mb-8">
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

        {/* Delete Local Data Button */}
        <TouchableOpacity
          onPress={handleDeleteLocalData}
          className="bg-red-500 rounded-xl p-4 items-center mb-8"
        >
          <Text className="text-white font-semibold text-lg" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.deleteLocalData')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SecuritySettings;
