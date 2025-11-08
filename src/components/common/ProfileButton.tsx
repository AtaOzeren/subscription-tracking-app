import React from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileButtonProps {
  onPress: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onPress }) => {
  const { user } = useAuth();
  const avatar = user?.avatar;
  const userName = user?.name || '';
  const userInitial = userName.charAt(0).toUpperCase() || 'U';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-10 h-10 rounded-full items-center justify-center overflow-hidden"
      activeOpacity={0.8}
      style={{ width: 40, height: 40 }}
    >
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          className="w-full h-full"
          style={{ width: 40, height: 40 }}
        />
      ) : (
        <View className="w-full h-full bg-black rounded-full items-center justify-center">
          <Text
            className="text-sm font-bold text-white"
            style={{ fontFamily: 'SF Pro Display' }}
          >
            {userInitial}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ProfileButton;