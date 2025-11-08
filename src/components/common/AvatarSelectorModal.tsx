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

// Sample avatar URLs with better variety
const sampleAvatars = [
  'https://i.pravatar.cc/300?img=1',
  'https://i.pravatar.cc/300?img=2',
  'https://i.pravatar.cc/300?img=3',
  'https://i.pravatar.cc/300?img=4',
  'https://i.pravatar.cc/300?img=5',
  'https://i.pravatar.cc/300?img=6',
  'https://i.pravatar.cc/300?img=7',
  'https://i.pravatar.cc/300?img=8',
  'https://i.pravatar.cc/300?img=9',
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
        quality: 0.8,
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
      <View className="flex-1 bg-white">
        {/* Simple Header with Close Button */}
        <View
          className="bg-white border-b border-gray-100"
          style={{ paddingTop: insets.top }}
        >
          <View className="px-6 py-4 flex-row justify-end">
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="text-xl font-bold text-gray-600">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Avatar Preview - Large and Centered */}
          <View className="items-center mb-8">
            {selectedAvatar ? (
              <View className="relative">
                <Image
                  source={{ uri: selectedAvatar }}
                  className="rounded-full"
                  style={{ 
                    width: 140, 
                    height: 140,
                    borderWidth: 4,
                    borderColor: '#000000',
                  }}
                />
                {/* Check mark indicator */}
                <View 
                  className="absolute bottom-1 right-1 bg-black rounded-full items-center justify-center"
                  style={{ width: 40, height: 40, borderWidth: 4, borderColor: 'white' }}
                >
                  <Text className="text-white font-bold text-xl">✓</Text>
                </View>
              </View>
            ) : (
              <View 
                className="rounded-full bg-gray-100 items-center justify-center"
                style={{ width: 140, height: 140, borderWidth: 4, borderColor: '#E5E7EB' }}
              >
                <Text className="text-6xl text-gray-400">👤</Text>
              </View>
            )}
          </View>

          {/* Choose from Gallery Button */}
          <View className="mb-6">
            <AppleButton
              title={t('profile.chooseFromGallery', { defaultValue: 'Choose from Gallery' })}
              onPress={pickImage}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="large"
            />
          </View>

          {/* Divider with Text */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t('common.or', { defaultValue: 'Or' })}
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Sample Avatars Grid */}
          <View className="mb-6">
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
              {sampleAvatars.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAvatarPress(avatar)}
                  className="mb-3"
                  style={{ width: '33.33%', paddingHorizontal: 6 }}
                  activeOpacity={0.7}
                >
                  <View className="relative">
                    <Image
                      source={{ uri: avatar }}
                      className="w-full rounded-2xl bg-gray-100"
                      style={{ 
                        aspectRatio: 1,
                        borderWidth: selectedAvatar === avatar ? 4 : 0,
                        borderColor: '#000000',
                      }}
                    />
                    {selectedAvatar === avatar && (
                      <View 
                        className="absolute inset-0 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                      >
                        <View className="bg-black rounded-full" style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                          <Text className="text-white font-bold text-lg">✓</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Save Button */}
        <View 
          className="bg-white border-t border-gray-100 px-6"
          style={{ 
            paddingBottom: insets.bottom + 16, 
            paddingTop: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <AppleButton
            title={t('common.save', { defaultValue: 'Save' })}
            onPress={handleSave}
            disabled={!selectedAvatar}
            variant="primary"
            size="large"
          />
        </View>
      </View>
    </Modal>
  );
};

export default AvatarSelectorModal;
