import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { profileService } from '../../../services/profileService';
import { storageService } from '../../../services/storageService';
import FormField from '../../../components/subscription/FormField';
import AppleButton from '../../../components/common/AppleButton';
import AvatarSelectorModal from '../../../components/common/AvatarSelectorModal';

interface ProfileUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentRegion?: string;
  currentCurrency?: string;
  currentAvatar?: string;
  onUpdateSuccess: () => void;
}

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  visible,
  onClose,
  currentName,
  currentRegion,
  currentCurrency,
  currentAvatar,
  onUpdateSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [editName, setEditName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [updating, setUpdating] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setEditName(currentName);
      setSelectedAvatar(currentAvatar);
    }
  }, [visible, currentName, currentAvatar]);

  const handleUpdate = async () => {
    if (!editName.trim()) {
      Alert.alert(t('common.error'), t('profile.nameRequired', { defaultValue: 'Name is required' }));
      return;
    }

    Alert.alert(
      t('profile.updateProfileTitle', { defaultValue: 'Update Profile' }),
      t('profile.updateProfileMessage', { defaultValue: 'Are you sure you want to update your profile?' }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.save'),
          style: 'default',
          onPress: async () => {
            try {
              setUpdating(true);

              // Save avatar to local storage FIRST (avatar is not sent to API)
              if (selectedAvatar) {
                // Validate avatar data before saving
                if (typeof selectedAvatar === 'string' && selectedAvatar.length > 0) {
                  console.log('ProfileUpdateModal: Saving avatar');
                  await storageService.setAvatar(selectedAvatar);
                } else {
                  console.warn('ProfileUpdateModal: Invalid avatar data, skipping save');
                }
              } else {
                console.log('ProfileUpdateModal: Removing avatar');
                await storageService.removeAvatar();
              }

              // Update profile on API (without avatar field)
              await profileService.updateProfile({
                name: editName.trim(),
                region: currentRegion,
                currency: currentCurrency,
              });

              onClose();
              onUpdateSuccess();

              Alert.alert(
                t('common.success'),
                t('profile.updateSuccess', { defaultValue: 'Profile updated successfully' })
              );
            } catch (error) {
              console.error('Error updating profile:', error);
              Alert.alert(
                t('common.error'),
                error instanceof Error ? error.message : t('profile.updateFailed', { defaultValue: 'Failed to update profile' })
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
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
                className="text-body-lg text-text-secondary font-semibold"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <Text
              className="text-heading-1 text-text-primary flex-1 text-center"
              style={{ fontFamily: 'SF Pro Display', letterSpacing: -0.5 }}
            >
              {t('profile.profileUpdate', { defaultValue: 'Profile Update' })}
            </Text>
            <View style={{ width: 60 }} />
          </View>
        </View>

        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
          {/* Avatar Section */}
          <View className="mb-6">
            <Text
              className="text-heading-4 text-text-primary mb-4"
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t('profile.avatar', { defaultValue: 'Avatar' })}
            </Text>
            <View className="items-center mb-4">
              {selectedAvatar ? (
                <Image
                  source={{ uri: selectedAvatar }}
                  className="w-24 h-24 rounded-full mb-3"
                  style={{ width: 96, height: 96 }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-3">
                  <Text
                    className="text-heading-1 text-accent"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {editName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <AppleButton
                title={t('profile.changeAvatar', { defaultValue: 'Change Avatar' })}
                onPress={() => setShowAvatarSelector(true)}
                variant="secondary"
                size="small"
              />
            </View>
          </View>

          {/* Name Field */}
          <FormField
            label={t('profile.name', { defaultValue: 'Name' })}
            value={editName}
            onChangeText={setEditName}
            placeholder={t('profile.namePlaceholder', { defaultValue: 'Enter your name' })}
          />

          {/* Save Button */}
          <AppleButton
            title={t('common.save', { defaultValue: 'Save' })}
            onPress={handleUpdate}
            disabled={updating}
            loading={updating}
            size="large"
            containerClassName="mb-6"
          />
        </ScrollView>
      </View>

      {/* Avatar Selector Modal */}
      <AvatarSelectorModal
        visible={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        onAvatarSelect={(avatar) => setSelectedAvatar(avatar)}
        currentAvatar={selectedAvatar}
      />
    </Modal>
  );
};

export default ProfileUpdateModal;
