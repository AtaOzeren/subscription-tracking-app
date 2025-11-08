import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Image, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AppleButton from './AppleButton';

interface AvatarSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onAvatarSelect: (avatar: string) => void;
  currentAvatar?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const avatarSize = (screenWidth - 48) / 3 - 8;

// Sample avatar URLs (copyright-free profile pictures)
const sampleAvatars = [
  'https://picsum.photos/seed/avatar1/200/200.jpg',
  'https://picsum.photos/seed/avatar2/200/200.jpg',
  'https://picsum.photos/seed/avatar3/200/200.jpg',
  'https://picsum.photos/seed/avatar4/200/200.jpg',
  'https://picsum.photos/seed/avatar5/200/200.jpg',
  'https://picsum.photos/seed/avatar6/200/200.jpg',
  'https://picsum.photos/seed/avatar7/200/200.jpg',
  'https://picsum.photos/seed/avatar8/200/200.jpg',
  'https://picsum.photos/seed/avatar9/200/200.jpg',
];

const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  visible,
  onClose,
  onAvatarSelect,
  currentAvatar,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setSelectedAvatar(currentAvatar || null);
    }
  }, [visible, currentAvatar]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.error'),
        t('profile.avatarPermissionDenied', { defaultValue: 'Permission to access camera roll is required!' })
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      setLoading(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Create file instance for validation and conversion
        const file = new FileSystem.File(asset.uri);
        
        // Validate file size (max 5MB) using new File API
        if (file.exists && file.size) {
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > 5) {
            Alert.alert(
              t('common.error'),
              t('profile.avatarTooLarge', { defaultValue: 'Image size must be less than 5MB' })
            );
            setLoading(false);
            return;
          }
        }
        
        // Convert to base64 for storage
        const base64 = await file.base64();
        
        const avatarData = `data:image/jpeg;base64,${base64}`;
        setSelectedAvatar(avatarData);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('common.error'),
        t('profile.avatarPickError', { defaultValue: 'Failed to pick image from gallery. Please try again.' })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (selectedAvatar) {
      onAvatarSelect(selectedAvatar);
      onClose();
    } else {
      Alert.alert(
        t('common.error'),
        t('profile.avatarSelectRequired', { defaultValue: 'Please select an avatar' })
      );
    }
  };

  const handleAvatarPress = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View
          className="bg-white border-b border-gray-200"
          style={{ paddingTop: insets.top }}
        >
          <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Text
                className="text-base font-semibold text-gray-700"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-3xl font-bold text-gray-900 flex-1 text-center"
              style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
            >
              {t('profile.selectAvatar', { defaultValue: 'Select Avatar' })}
            </Text>
            <View style={{ width: 60 }} />
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
          {/* Current Avatar Preview */}
          <View className="px-4 mb-6">
            <Text
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t('profile.currentAvatar', { defaultValue: 'Current Avatar' })}
            </Text>
            <View className="items-center">
              {selectedAvatar ? (
                <Image
                  source={{ uri: selectedAvatar }}
                  className="w-24 h-24 rounded-full"
                  style={{ width: 96, height: 96 }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
                  <Text className="text-2xl text-gray-500">?</Text>
                </View>
              )}
            </View>
          </View>

          {/* Sample Avatars */}
          <View className="px-4 mb-6">
            <Text
              className="text-lg font-semibold text-gray-900 mb-4"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t('profile.sampleAvatars', { defaultValue: 'Sample Avatars' })}
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {sampleAvatars.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAvatarPress(avatar)}
                  className={`mb-2 rounded-lg overflow-hidden border-2 ${
                    selectedAvatar === avatar ? 'border-blue-500' : 'border-transparent'
                  }`}
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  <Image
                    source={{ uri: avatar }}
                    className="w-full h-full"
                    style={{ width: avatarSize, height: avatarSize }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gallery Option */}
          <View className="px-4 mb-6">
            <AppleButton
              title={t('profile.chooseFromGallery', { defaultValue: 'Choose from Gallery' })}
              onPress={pickImage}
              loading={loading}
              disabled={loading}
              variant="secondary"
              size="large"
            />
          </View>

          {/* Save Button */}
          <View className="px-4">
            <AppleButton
              title={t('common.save', { defaultValue: 'Save' })}
              onPress={handleSave}
              disabled={!selectedAvatar}
              size="large"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default AvatarSelectorModal;