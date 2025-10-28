import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileButtonProps {
  onPress: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-10 h-10 bg-black rounded-full items-center justify-center"
      activeOpacity={0.8}
    >
      <Ionicons 
        name="person" 
        size={20} 
        color="#FFFFFF" 
      />
    </TouchableOpacity>
  );
};

export default ProfileButton;